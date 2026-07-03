import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import ChannelsClient, { type ChannelSettings } from "./ChannelsClient";

export const dynamic = "force-dynamic";

const TELEGRAM_BOT_USERNAME = "TJPingBot";

interface ChannelSettingsRow {
  email_enabled: boolean;
  email_address: string;
  telegram_enabled: boolean;
  telegram_chat_id: string;
  telegram_username: string;
}

export default async function ChannelsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <ChannelsClient
        settings={null}
        fallbackEmail=""
        userEmail=""
        botUsername={TELEGRAM_BOT_USERNAME}
        isDemo
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("notification_channel_settings")
    .select(
      "email_enabled,email_address,telegram_enabled,telegram_chat_id,telegram_username",
    )
    .eq("user_id", user.id)
    .maybeSingle<ChannelSettingsRow>();

  const settings: ChannelSettings | null = data
    ? {
        emailEnabled: data.email_enabled,
        emailAddress: data.email_address,
        telegramEnabled: data.telegram_enabled,
        telegramChatId: data.telegram_chat_id,
        telegramUsername: data.telegram_username,
      }
    : null;

  return (
    <ChannelsClient
      settings={settings}
      fallbackEmail={user.email || ""}
      userEmail={user.email || ""}
      botUsername={TELEGRAM_BOT_USERNAME}
    />
  );
}
