import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import RemindersClient, { type ReminderItem } from "./RemindersClient";

export const dynamic = "force-dynamic";

interface ReminderRow {
  id: string;
  title: string;
  content: string;
  remind_at: string;
  repeat_type: string;
  weekly_days: number[] | null;
  status: string;
  channels: string[];
}

interface ReminderStepRow {
  reminder_id: string;
  step_type: string;
}

interface DeliveryLogRow {
  id: string;
  reminder_id: string;
  channel: string;
  status: string;
  step_type: string;
  scheduled_at: string;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
}

interface ChannelSettingsRow {
  telegram_enabled: boolean;
  telegram_chat_id: string | null;
  telegram_username: string | null;
}

export default async function RemindersPage() {
  if (!isSupabaseConfigured()) {
    return <RemindersClient reminders={[]} isDemo />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: remindersData } = await supabase
    .from("reminders")
    .select("id,title,content,remind_at,repeat_type,weekly_days,status,channels")
    .eq("user_id", user.id)
    .order("remind_at", { ascending: false })
    .limit(12)
    .returns<ReminderRow[]>();

  const { data: channelSettings } = await supabase
    .from("notification_channel_settings")
    .select("telegram_enabled,telegram_chat_id,telegram_username")
    .eq("user_id", user.id)
    .maybeSingle<ChannelSettingsRow>();

  const reminderIds = (remindersData || []).map((item) => item.id);

  const { data: reminderStepsData } =
    reminderIds.length > 0
      ? await supabase
          .from("reminder_steps")
          .select("reminder_id,step_type")
          .in("reminder_id", reminderIds)
          .returns<ReminderStepRow[]>()
      : { data: [] as ReminderStepRow[] };

  const { data: deliveryLogsData } =
    reminderIds.length > 0
      ? await supabase
          .from("delivery_logs")
          .select(
            "id,reminder_id,channel,status,step_type,scheduled_at,sent_at,error_message,created_at",
          )
          .in("reminder_id", reminderIds)
          .order("created_at", { ascending: false })
          .returns<DeliveryLogRow[]>()
      : { data: [] as DeliveryLogRow[] };

  const stepTypesByReminderId = (reminderStepsData || []).reduce<
    Record<string, string[]>
  >((accumulator, item) => {
    if (!accumulator[item.reminder_id]) {
      accumulator[item.reminder_id] = [];
    }

    accumulator[item.reminder_id].push(item.step_type);
    return accumulator;
  }, {});

  const logsByReminderId = (deliveryLogsData || []).reduce<
    Record<string, DeliveryLogRow[]>
  >((accumulator, item) => {
    if (!accumulator[item.reminder_id]) {
      accumulator[item.reminder_id] = [];
    }

    if (accumulator[item.reminder_id].length < 3) {
      accumulator[item.reminder_id].push(item);
    }

    return accumulator;
  }, {});

  const reminders: ReminderItem[] = (remindersData || []).map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    remindAt: item.remind_at,
    repeatType: item.repeat_type,
    weeklyDays: item.weekly_days || [],
    status: item.status,
    channels: item.channels.map(mapChannel),
    stepTypes: stepTypesByReminderId[item.id] || ["on_time"],
    logs: (logsByReminderId[item.id] || []).map((log) => ({
      id: log.id,
      channel: mapChannel(log.channel),
      status: log.status,
      stepType: log.step_type,
      scheduledAt: log.scheduled_at,
      sentAt: log.sent_at,
      errorMessage: log.error_message,
      createdAt: log.created_at,
    })),
  }));

  return (
    <RemindersClient
      userEmail={user.email || undefined}
      userName={
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : undefined
      }
      reminders={reminders}
      telegramConfigured={
        Boolean(channelSettings?.telegram_enabled) &&
        Boolean(
          channelSettings?.telegram_chat_id?.trim() ||
            channelSettings?.telegram_username?.trim(),
        )
      }
    />
  );
}

function mapChannel(value: string) {
  if (value === "email") return "Email";
  if (value === "telegram") return "Telegram";
  return value;
}
