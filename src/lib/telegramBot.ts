import { createAdminClient } from "@/lib/supabase/admin";

export interface TelegramCommandContext {
  chatId: string;
  username: string;
  text: string;
}

interface ReminderCommandPayload {
  title: string;
  remindAt: Date;
}

interface ReminderRow {
  id: string;
  title: string;
  remind_at: string;
  status: string;
}

function padTwoDigits(value: number) {
  return String(value).padStart(2, "0");
}

export function buildTelegramLinkToken() {
  return crypto.randomUUID().replace(/-/g, "");
}

export function getTelegramBotUsername() {
  return process.env.TELEGRAM_BOT_USERNAME || "TJPingBot";
}

export function getTelegramDeepLink(token: string) {
  return `https://t.me/${getTelegramBotUsername().replace(/^@/, "")}?start=${token}`;
}

export function parseTelegramCommand(text: string) {
  const trimmed = text.trim();
  const [rawCommand = "", ...args] = trimmed.split(/\s+/);
  const command = rawCommand.split("@")[0].toLowerCase();

  return {
    command,
    args,
    rawArgs: trimmed.slice(rawCommand.length).trim(),
  };
}

export function parseReminderCommand(rawArgs: string): ReminderCommandPayload | null {
  const match = rawArgs.match(
    /^(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})\s+(.+)$/u,
  );

  if (!match) {
    return null;
  }

  const [, date, time, title] = match;
  const remindAt = parseVietnameseDateTime(date, time);

  if (!remindAt || !title.trim()) {
    return null;
  }

  return {
    title: title.trim(),
    remindAt,
  };
}

export function parseVietnameseDateTime(dateValue: string, timeValue: string) {
  const [day, month, year] = dateValue.split("/").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);

  if (!day || !month || !year || Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day, hour - 7, minute));
}

export function formatTelegramDateTime(dateValue: string | Date) {
  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  const bangkokDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  return `${padTwoDigits(bangkokDate.getUTCDate())}/${padTwoDigits(
    bangkokDate.getUTCMonth() + 1,
  )}/${bangkokDate.getUTCFullYear()} ${padTwoDigits(
    bangkokDate.getUTCHours(),
  )}:${padTwoDigits(bangkokDate.getUTCMinutes())}`;
}

function buildReminderSteps(reminderId: string, userId: string, remindAt: Date) {
  return [
    {
      reminder_id: reminderId,
      user_id: userId,
      step_type: "on_time",
      scheduled_at: remindAt.toISOString(),
    },
  ];
}

export async function linkTelegramAccount({
  token,
  chatId,
  username,
}: {
  token: string;
  chatId: string;
  username: string;
}) {
  const supabase = createAdminClient();

  const { data: settings, error: settingsError } = await supabase
    .from("notification_channel_settings")
    .select("user_id,telegram_link_token_expires_at")
    .eq("telegram_link_token", token)
    .maybeSingle<{
      user_id: string;
      telegram_link_token_expires_at: string | null;
    }>();

  if (settingsError) {
    throw new Error("Không thể kiểm tra token liên kết Telegram.");
  }

  if (!settings) {
    return { success: false as const, message: "Token liên kết không hợp lệ hoặc đã hết hạn." };
  }

  if (
    settings.telegram_link_token_expires_at &&
    new Date(settings.telegram_link_token_expires_at).getTime() < Date.now()
  ) {
    return { success: false as const, message: "Token liên kết đã hết hạn. Vui lòng tạo token mới trong TJPing." };
  }

  const { error: updateError } = await supabase
    .from("notification_channel_settings")
    .update({
      telegram_enabled: true,
      telegram_chat_id: chatId,
      telegram_username: username,
      telegram_connected_at: new Date().toISOString(),
      telegram_link_token: null,
      telegram_link_token_expires_at: null,
    })
    .eq("user_id", settings.user_id);

  if (updateError) {
    throw new Error("Không thể lưu kết nối Telegram cho tài khoản.");
  }

  return { success: true as const, message: "Đã liên kết Telegram với tài khoản TJPing. Bây giờ bạn có thể dùng /remind, /list và /delete." };
}

export async function createTelegramReminder({
  chatId,
  title,
  remindAt,
}: {
  chatId: string;
  title: string;
  remindAt: Date;
}) {
  const supabase = createAdminClient();

  const { data: settings, error: settingsError } = await supabase
    .from("notification_channel_settings")
    .select("user_id")
    .eq("telegram_chat_id", chatId)
    .eq("telegram_enabled", true)
    .maybeSingle<{ user_id: string }>();

  if (settingsError) {
    throw new Error("Không thể kiểm tra kết nối Telegram.");
  }

  if (!settings) {
    return {
      success: false as const,
      message:
        "Chat Telegram này chưa được liên kết. Vào trang Kênh gửi trong TJPing để kết nối bot trước.",
    };
  }

  const { data: reminder, error: reminderError } = await supabase
    .from("reminders")
    .insert({
      user_id: settings.user_id,
      title,
      content: `Tạo nhanh từ Telegram bot lúc ${formatTelegramDateTime(new Date())}.`,
      remind_at: remindAt.toISOString(),
      channels: ["telegram"],
      repeat_type: "once",
      status: "pending",
    })
    .select("id")
    .single<{ id: string }>();

  if (reminderError || !reminder) {
    throw new Error("Không thể tạo lời nhắc từ Telegram.");
  }

  const { error: stepsError } = await supabase
    .from("reminder_steps")
    .insert(buildReminderSteps(reminder.id, settings.user_id, remindAt));

  if (stepsError) {
    throw new Error("Không thể tạo bước nhắc cho reminder Telegram.");
  }

  return {
    success: true as const,
    message: [
      "Đã tạo lời nhắc mới.",
      `Tiêu đề: ${title}`,
      `Thời gian: ${formatTelegramDateTime(remindAt)}`,
      "Kênh: Telegram",
    ].join("\n"),
  };
}

export async function listTelegramReminders(chatId: string) {
  const supabase = createAdminClient();

  const { data: settings, error: settingsError } = await supabase
    .from("notification_channel_settings")
    .select("user_id")
    .eq("telegram_chat_id", chatId)
    .eq("telegram_enabled", true)
    .maybeSingle<{ user_id: string }>();

  if (settingsError) {
    throw new Error("Không thể kiểm tra kết nối Telegram.");
  }

  if (!settings) {
    return {
      success: false as const,
      message:
        "Chat Telegram này chưa được liên kết. Vào trang Kênh gửi trong TJPing để kết nối bot trước.",
    };
  }

  const { data: reminders, error: remindersError } = await supabase
    .from("reminders")
    .select("id,title,remind_at,status")
    .eq("user_id", settings.user_id)
    .in("status", ["pending", "failed"])
    .order("remind_at", { ascending: true })
    .limit(10)
    .returns<ReminderRow[]>();

  if (remindersError) {
    throw new Error("Không thể tải danh sách reminder.");
  }

  if (!reminders || reminders.length === 0) {
    return { success: true as const, message: "Hiện chưa có lời nhắc pending hoặc failed nào." };
  }

  return {
    success: true as const,
    message: [
      "Danh sách lời nhắc gần nhất:",
      ...reminders.map(
        (item, index) =>
          `${index + 1}. [${item.id.slice(0, 8)}] ${item.title} - ${formatTelegramDateTime(
            item.remind_at,
          )} - ${item.status}`,
      ),
    ].join("\n"),
  };
}

export async function deleteTelegramReminder({
  chatId,
  reminderCode,
}: {
  chatId: string;
  reminderCode: string;
}) {
  const supabase = createAdminClient();

  const { data: settings, error: settingsError } = await supabase
    .from("notification_channel_settings")
    .select("user_id")
    .eq("telegram_chat_id", chatId)
    .eq("telegram_enabled", true)
    .maybeSingle<{ user_id: string }>();

  if (settingsError) {
    throw new Error("Kh?ng th? ki?m tra k?t n?i Telegram.");
  }

  if (!settings) {
    return {
      success: false as const,
      message:
        "Chat Telegram n?y ch?a ???c li?n k?t. V?o trang K?nh g?i trong TJPing ?? k?t n?i bot tr??c.",
    };
  }

  const normalizedReminderCode = reminderCode.trim().toLowerCase();

  const { data: reminders, error: remindersError } = await supabase
    .from("reminders")
    .select("id,title")
    .eq("user_id", settings.user_id)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<Array<{ id: string; title: string }>>();

  if (remindersError) {
    throw new Error("Kh?ng th? t?m reminder c?n x?a.");
  }

  const matchedReminders =
    reminders?.filter((item) =>
      item.id.toLowerCase().startsWith(normalizedReminderCode),
    ) || [];

  if (matchedReminders.length === 0) {
    return {
      success: false as const,
      message: "Kh?ng t?m th?y reminder v?i m? ?? nh?p.",
    };
  }

  if (matchedReminders.length > 1) {
    return {
      success: false as const,
      message:
        "M? reminder ?ang b? tr?ng. Vui l?ng d?ng nhi?u k? t? h?n trong m? ID.",
    };
  }

  const reminder = matchedReminders[0];

  const { error: deleteError } = await supabase
    .from("reminders")
    .delete()
    .eq("id", reminder.id)
    .eq("user_id", settings.user_id);

  if (deleteError) {
    throw new Error("Kh?ng th? x?a reminder t? Telegram.");
  }

  return {
    success: true as const,
    message: `?? x?a l?i nh?c [${reminder.id.slice(0, 8)}] ${reminder.title}.`,
  };
}

export function buildTelegramHelpMessage() {
  return [
    "Các lệnh hỗ trợ:",
    "/start <token> - Liên kết bot với tài khoản TJPing",
    "/remind dd/mm/yyyy HH:mm nội dung - Tạo lời nhắc nhanh",
    "/list - Xem 10 lời nhắc pending/failed gần nhất",
    "/delete <id-prefix> - Xóa lời nhắc theo 8 ký tự đầu của ID",
    "/help - Xem hướng dẫn",
    "",
    "Ví dụ:",
    "/remind 05/07/2026 07:45 Họp team sale",
  ].join("\n");
}
