import { redirect } from "next/navigation";
import DashboardClient, { type DashboardReminder } from "./DashboardClient";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

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

interface ChannelSettingsRow {
  telegram_enabled: boolean;
  telegram_chat_id: string | null;
  telegram_username: string | null;
}

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    return <DashboardClient reminders={[]} isDemo />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("reminders")
    .select("id,title,content,remind_at,repeat_type,weekly_days,status,channels")
    .eq("user_id", user.id)
    .order("remind_at", { ascending: true })
    .limit(8)
    .returns<ReminderRow[]>();

  const { data: channelSettings } = await supabase
    .from("notification_channel_settings")
    .select("telegram_enabled,telegram_chat_id,telegram_username")
    .eq("user_id", user.id)
    .maybeSingle<ChannelSettingsRow>();

  const reminders: DashboardReminder[] = (data || []).map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    remindAt: item.remind_at,
    repeatType: item.repeat_type,
    weeklyDays: item.weekly_days || [],
    status: item.status,
    channels: item.channels.map(mapChannel),
  }));

  return (
    <DashboardClient
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
