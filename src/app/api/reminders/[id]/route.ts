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

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase chưa được cấu hình." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const payload = (await request.json()) as {
    title?: string;
    content?: string;
    date?: string;
    time?: string;
    repeatType?: string;
    channels?: string[];
    stepTypes?: string[];
    status?: string;
  };

  const title = String(payload.title || "").trim();
  const content = String(payload.content || "").trim();
  const date = String(payload.date || "").trim();
  const time = String(payload.time || "").trim();
  const repeatType = String(payload.repeatType || "once").trim();
  const channels = Array.isArray(payload.channels)
    ? payload.channels.map(String)
    : [];
  const stepTypes = Array.isArray(payload.stepTypes)
    ? payload.stepTypes.map(String)
    : [];
  const remindAt = parseVietnameseDateTime(date, time);

  if (
    !title ||
    !content ||
    !remindAt ||
    channels.length === 0 ||
    stepTypes.length === 0
  ) {
    return NextResponse.json(
      { error: "Dữ liệu cập nhật không hợp lệ." },
      { status: 400 },
    );
  }

  const { error: reminderError } = await supabase
    .from("reminders")
    .update({
      title,
      content,
      remind_at: remindAt.toISOString(),
      repeat_type: repeatType,
      channels,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (reminderError) {
    return NextResponse.json(
      { error: "Không thể cập nhật lời nhắc." },
      { status: 500 },
    );
  }

  const { error: deleteStepsError } = await supabase
    .from("reminder_steps")
    .delete()
    .eq("reminder_id", id)
    .eq("user_id", user.id);

  if (deleteStepsError) {
    return NextResponse.json(
      { error: "Không thể đồng bộ các bước nhắc." },
      { status: 500 },
    );
  }

  const { error: insertStepsError } = await supabase
    .from("reminder_steps")
    .insert(buildReminderSteps(id, user.id, remindAt, stepTypes));

  if (insertStepsError) {
    return NextResponse.json(
      { error: "Không thể cập nhật các bước nhắc." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase chưa được cấu hình." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const { error: deleteStepsError } = await supabase
    .from("reminder_steps")
    .delete()
    .eq("reminder_id", id)
    .eq("user_id", user.id);

  if (deleteStepsError) {
    return NextResponse.json(
      { error: "Không thể xóa các bước nhắc." },
      { status: 500 },
    );
  }

  const { error: reminderError } = await supabase
    .from("reminders")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (reminderError) {
    return NextResponse.json(
      { error: "Không thể xóa lời nhắc." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
