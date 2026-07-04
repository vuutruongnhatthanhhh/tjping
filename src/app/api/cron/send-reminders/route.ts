import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  deliverReminderChannel,
  getNextOccurrence,
  type DeliveryReminder,
  type DeliveryStep,
  type NotificationChannelSettings,
  type ReminderChannel,
} from "@/lib/reminderDelivery";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ReminderStepRow {
  id: string;
  reminder_id: string;
  user_id: string;
  step_type: "one_day_before" | "one_hour_before" | "on_time";
  scheduled_at: string;
  status: string;
}

interface ReminderRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  remind_at: string;
  repeat_type: "once" | "daily" | "weekly" | "monthly" | "custom_weekly";
  weekly_days: number[] | null;
  status: string;
  channels: ReminderChannel[];
}

interface ChannelSettingsRow {
  user_id: string;
  email_enabled: boolean;
  email_address: string;
  telegram_enabled: boolean;
  telegram_chat_id: string;
  telegram_username: string;
}

interface DeliveryLogRow {
  id: string;
}

interface ProcessStats {
  scannedSteps: number;
  processedSteps: number;
  sentLogs: number;
  failedLogs: number;
  skippedSteps: number;
}

async function runDelivery() {
  const supabase = createAdminClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const stats: ProcessStats = {
    scannedSteps: 0,
    processedSteps: 0,
    sentLogs: 0,
    failedLogs: 0,
    skippedSteps: 0,
  };

  const { data: dueSteps, error: dueStepsError } = await supabase
    .from("reminder_steps")
    .select("id,reminder_id,user_id,step_type,scheduled_at,status")
    .eq("status", "pending")
    .lte("scheduled_at", nowIso)
    .order("scheduled_at", { ascending: true })
    .limit(50)
    .returns<ReminderStepRow[]>();

  if (dueStepsError) {
    throw new Error(`Không thể tải reminder đến hạn: ${dueStepsError.message}`);
  }

  stats.scannedSteps = dueSteps.length;

  if (dueSteps.length === 0) {
    return stats;
  }

  const reminderIds = [...new Set(dueSteps.map((item) => item.reminder_id))];
  const userIds = [...new Set(dueSteps.map((item) => item.user_id))];

  const [{ data: remindersData, error: remindersError }, { data: settingsData, error: settingsError }] =
    await Promise.all([
      supabase
        .from("reminders")
        .select("id,user_id,title,content,remind_at,repeat_type,weekly_days,status,channels")
        .in("id", reminderIds)
        .returns<ReminderRow[]>(),
      supabase
        .from("notification_channel_settings")
        .select(
          "user_id,email_enabled,email_address,telegram_enabled,telegram_chat_id,telegram_username",
        )
        .in("user_id", userIds)
        .returns<ChannelSettingsRow[]>(),
    ]);

  if (remindersError) {
    throw new Error(`Không thể tải reminder gốc: ${remindersError.message}`);
  }

  if (settingsError) {
    throw new Error(
      `Không thể tải cấu hình kênh gửi: ${settingsError.message}`,
    );
  }

  const remindersById = new Map<string, DeliveryReminder>(
    (remindersData || []).map((item) => [
      item.id,
      {
        id: item.id,
        userId: item.user_id,
        title: item.title,
        content: item.content,
        remindAt: item.remind_at,
        repeatType: item.repeat_type,
        weeklyDays: item.weekly_days || [],
        status: item.status,
        channels: item.channels || [],
      },
    ]),
  );

  const settingsByUserId = new Map<string, NotificationChannelSettings>(
    (settingsData || []).map((item) => [
      item.user_id,
      {
        userId: item.user_id,
        emailEnabled: item.email_enabled,
        emailAddress: item.email_address,
        telegramEnabled: item.telegram_enabled,
        telegramChatId: item.telegram_chat_id,
        telegramUsername: item.telegram_username,
      },
    ]),
  );

  for (const stepRow of dueSteps) {
    const reminder = remindersById.get(stepRow.reminder_id);

    if (!reminder || reminder.status === "canceled") {
      await markStepCanceled(supabase, stepRow.id);
      stats.skippedSteps += 1;
      continue;
    }

    const settings = settingsByUserId.get(stepRow.user_id) || null;
    const result = await processStep({
      supabase,
      reminder,
      step: {
        id: stepRow.id,
        reminderId: stepRow.reminder_id,
        userId: stepRow.user_id,
        stepType: stepRow.step_type,
        scheduledAt: stepRow.scheduled_at,
        status: stepRow.status,
      },
      settings,
      now,
    });

    stats.processedSteps += result.processed ? 1 : 0;
    stats.sentLogs += result.sentLogs;
    stats.failedLogs += result.failedLogs;
    stats.skippedSteps += result.skipped ? 1 : 0;
  }

  return stats;
}

async function processStep({
  supabase,
  reminder,
  step,
  settings,
  now,
}: {
  supabase: SupabaseClient;
  reminder: DeliveryReminder;
  step: DeliveryStep;
  settings: NotificationChannelSettings | null;
  now: Date;
}) {
  let sentLogs = 0;
  let failedLogs = 0;
  let claimedCount = 0;
  let successCount = 0;
  let failureCount = 0;

  for (const channel of reminder.channels) {
    const claimedLog = await claimDeliveryLog({
      supabase,
      reminder,
      step,
      channel,
    });

    if (!claimedLog) {
      continue;
    }

    claimedCount += 1;

    try {
      const deliveryResult = await deliverReminderChannel({
        channel,
        reminder,
        settings,
        stepType: step.stepType,
      });

      await supabase
        .from("delivery_logs")
        .update({
          status: "sent",
          provider_message_id: deliveryResult.providerMessageId,
          error_message: null,
          sent_at: new Date().toISOString(),
        })
        .eq("id", claimedLog.id);

      sentLogs += 1;
      successCount += 1;
    } catch (error) {
      await supabase
        .from("delivery_logs")
        .update({
          status: "failed",
          provider_message_id: null,
          error_message: toErrorMessage(error),
          sent_at: new Date().toISOString(),
        })
        .eq("id", claimedLog.id);

      failedLogs += 1;
      failureCount += 1;
    }
  }

  if (claimedCount === 0) {
    return {
      processed: false,
      skipped: true,
      sentLogs,
      failedLogs,
    };
  }

  if (reminder.repeatType === "once") {
    const nextStepStatus =
      failureCount > 0 || successCount === 0 ? "failed" : "sent";

    await supabase
      .from("reminder_steps")
      .update({ status: nextStepStatus })
      .eq("id", step.id);

    const { count } = await supabase
      .from("reminder_steps")
      .select("id", { count: "exact", head: true })
      .eq("reminder_id", reminder.id)
      .eq("status", "pending");

    if ((count || 0) === 0) {
      const { data: finalLogs } = await supabase
        .from("delivery_logs")
        .select("status")
        .eq("reminder_id", reminder.id);

      const hasFailedLog = (finalLogs || []).some(
        (item) => item.status === "failed",
      );
      const hasSentLog = (finalLogs || []).some((item) => item.status === "sent");

      await supabase
        .from("reminders")
        .update({
          status: hasFailedLog ? "failed" : hasSentLog ? "sent" : "failed",
        })
        .eq("id", reminder.id);
    }
  } else {
    const nextScheduledAt = getNextOccurrence(
      step.scheduledAt,
      reminder.repeatType,
      now,
      reminder.weeklyDays,
    );

    await supabase
      .from("reminder_steps")
      .update({
        scheduled_at: nextScheduledAt,
        status: "pending",
      })
      .eq("id", step.id);

    if (step.stepType === "on_time") {
      const nextRemindAt = getNextOccurrence(
        reminder.remindAt,
        reminder.repeatType,
        now,
        reminder.weeklyDays,
      );

      await supabase
        .from("reminders")
        .update({
          remind_at: nextRemindAt,
          status: "pending",
        })
        .eq("id", reminder.id);
    }
  }

  return {
    processed: true,
    skipped: false,
    sentLogs,
    failedLogs,
  };
}

async function claimDeliveryLog({
  supabase,
  reminder,
  step,
  channel,
}: {
  supabase: SupabaseClient;
  reminder: DeliveryReminder;
  step: DeliveryStep;
  channel: ReminderChannel;
}) {
  const { data, error } = await supabase
    .from("delivery_logs")
    .insert({
      reminder_id: reminder.id,
      user_id: reminder.userId,
      channel,
      status: "pending",
      step_type: step.stepType,
      scheduled_at: step.scheduledAt,
    })
    .select("id")
    .single<DeliveryLogRow>();

  if (!error) {
    return data;
  }

  if (error.code === "23505") {
    return null;
  }

  throw new Error(`Không thể tạo delivery log: ${error.message}`);
}

async function markStepCanceled(supabase: SupabaseClient, stepId: string) {
  await supabase
    .from("reminder_steps")
    .update({ status: "canceled" })
    .eq("id", stepId);
}

async function handleRequest(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret) {
    return NextResponse.json(
      { error: "Thiếu cấu hình CRON_SECRET." },
      { status: 500 },
    );
  }

  if (authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 401 });
  }

  try {
    const stats = await runDelivery();
    return NextResponse.json({
      success: true,
      ...stats,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: toErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Lỗi không xác định.";
}
