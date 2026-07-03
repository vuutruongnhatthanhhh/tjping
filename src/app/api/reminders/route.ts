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
  const remindAt = parseVietnameseDateTime(date, time);

  if (!title || !remindAt || channels.length === 0) {
    return NextResponse.json(
      { error: "Thiếu tiêu đề, thời gian hoặc kênh gửi." },
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

  const oneDayBefore = new Date(remindAt);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  const oneHourBefore = new Date(remindAt);
  oneHourBefore.setHours(oneHourBefore.getHours() - 1);

  await supabase.from("reminder_steps").insert([
    {
      reminder_id: reminder.id,
      user_id: user.id,
      step_type: "one_day_before",
      scheduled_at: oneDayBefore.toISOString(),
    },
    {
      reminder_id: reminder.id,
      user_id: user.id,
      step_type: "one_hour_before",
      scheduled_at: oneHourBefore.toISOString(),
    },
    {
      reminder_id: reminder.id,
      user_id: user.id,
      step_type: "on_time",
      scheduled_at: remindAt.toISOString(),
    },
  ]);

  return NextResponse.json({ id: reminder.id });
}
