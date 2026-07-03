import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

function parseVietnameseDateTime(dateValue: string, timeValue: string) {
  const [day, month, year] = dateValue.split("/").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);

  if (!day || !month || !year || Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute);
}

function buildReminderSteps(
  reminderId: string,
  userId: string,
  remindAt: Date,
  stepTypes: string[],
) {
  return stepTypes.map((stepType) => {
    const scheduledAt = new Date(remindAt);

    if (stepType === "one_day_before") {
      scheduledAt.setDate(scheduledAt.getDate() - 1);
    } else if (stepType === "one_hour_before") {
      scheduledAt.setHours(scheduledAt.getHours() - 1);
    }

    return {
      reminder_id: reminderId,
      user_id: userId,
      step_type: stepType,
      scheduled_at: scheduledAt.toISOString(),
    };
  });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase chưa được cấu hình." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const date = String(formData.get("date") || "").trim();
  const time = String(formData.get("time") || "").trim();
  const repeatType = String(formData.get("repeatType") || "once");
  const channels = formData.getAll("channels").map(String);
  const stepTypes = formData.getAll("stepTypes").map(String);
  const remindAt = parseVietnameseDateTime(date, time);

  if (!title || !remindAt || channels.length === 0 || stepTypes.length === 0) {
    return NextResponse.json(
      { error: "Thiếu tiêu đề, thời gian, kênh gửi hoặc mốc nhắc." },
      { status: 400 },
    );
  }

  const { data: reminder, error: reminderError } = await supabase
    .from("reminders")
    .insert({
      user_id: user.id,
      title,
      content,
      remind_at: remindAt.toISOString(),
      repeat_type: repeatType,
      channels,
      status: "pending",
    })
    .select("id")
    .single();

  if (reminderError || !reminder) {
    return NextResponse.json(
      { error: "Không thể tạo lời nhắc." },
      { status: 500 },
    );
  }

  const { error: stepError } = await supabase
    .from("reminder_steps")
    .insert(buildReminderSteps(reminder.id, user.id, remindAt, stepTypes));

  if (stepError) {
    return NextResponse.json(
      { error: "Không thể tạo các bước nhắc." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: reminder.id });
}
