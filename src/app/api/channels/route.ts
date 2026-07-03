import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const TELEGRAM_BOT_USERNAME = "TJPingBot";

export async function PUT(request: Request) {
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

  const payload = (await request.json()) as {
    emailEnabled?: boolean;
    emailAddress?: string;
    telegramEnabled?: boolean;
    telegramChatId?: string;
    telegramUsername?: string;
  };

  const emailEnabled = Boolean(payload.emailEnabled);
  const emailAddress = String(payload.emailAddress || "").trim();
  const telegramEnabled = Boolean(payload.telegramEnabled);
  const telegramChatId = String(payload.telegramChatId || "").trim();
  const telegramUsername = String(payload.telegramUsername || "").trim();

  if (emailEnabled && !emailAddress) {
    return NextResponse.json(
      { error: "Vui lòng nhập email nhận thông báo." },
      { status: 400 },
    );
  }

  if (telegramEnabled && !telegramChatId && !telegramUsername) {
    return NextResponse.json(
      { error: "Vui lòng nhập Telegram chat ID hoặc username." },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("notification_channel_settings").upsert(
    {
      user_id: user.id,
      email_enabled: emailEnabled,
      email_address: emailAddress,
      telegram_enabled: telegramEnabled,
      telegram_chat_id: telegramChatId,
      telegram_username: telegramUsername,
      telegram_bot_name: TELEGRAM_BOT_USERNAME,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return NextResponse.json(
      { error: "Không thể lưu cấu hình kênh gửi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
