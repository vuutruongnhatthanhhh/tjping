import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  buildTelegramLinkToken,
  getTelegramDeepLink,
} from "@/lib/telegramBot";

const LINK_TOKEN_TTL_MINUTES = 30;

export async function POST() {
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

  const token = buildTelegramLinkToken();
  const expiresAt = new Date(
    Date.now() + LINK_TOKEN_TTL_MINUTES * 60 * 1000,
  ).toISOString();

  const { error } = await supabase.from("notification_channel_settings").upsert(
    {
      user_id: user.id,
      telegram_link_token: token,
      telegram_link_token_expires_at: expiresAt,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return NextResponse.json(
      { error: "Không thể tạo mã liên kết Telegram." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    token,
    expiresAt,
    botUrl: getTelegramDeepLink(token),
    command: `/start ${token}`,
  });
}
