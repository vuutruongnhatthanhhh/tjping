import { sendMail } from "@/lib/mailer";
import { sendTelegramMessage } from "@/lib/telegram";

export type ReminderChannel = "email" | "telegram";
export type ReminderRepeatType =
  | "once"
  | "daily"
  | "weekly"
  | "monthly"
  | "custom_weekly";
export type ReminderStepType =
  | "one_day_before"
  | "one_hour_before"
  | "on_time";

export interface DeliveryReminder {
  id: string;
  userId: string;
  title: string;
  content: string;
  remindAt: string;
  repeatType: ReminderRepeatType;
  weeklyDays: number[];
  status: string;
  channels: ReminderChannel[];
}

export interface DeliveryStep {
  id: string;
  reminderId: string;
  userId: string;
  stepType: ReminderStepType;
  scheduledAt: string;
  status: string;
}

export interface NotificationChannelSettings {
  userId: string;
  emailEnabled: boolean;
  emailAddress: string;
  telegramEnabled: boolean;
  telegramChatId: string;
  telegramUsername: string;
}

export function mapStepTypeLabel(stepType: ReminderStepType) {
  const labels: Record<ReminderStepType, string> = {
    one_day_before: "Trước 1 ngày",
    one_hour_before: "Trước 1 giờ",
    on_time: "Đúng giờ",
  };

  return labels[stepType];
}

export function formatReminderDateTime(dateValue: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(dateValue));
}

export function renderReminderEmailHtml({
  reminder,
  stepType,
}: {
  reminder: DeliveryReminder;
  stepType: ReminderStepType;
}) {
  const stepLabel = mapStepTypeLabel(stepType);
  const remindAtLabel = formatReminderDateTime(reminder.remindAt);
  const contentHtml = reminder.content
    ? `<p style="margin:0 0 16px;color:#334155;line-height:1.7;">${escapeHtml(reminder.content).replace(/\n/g, "<br />")}</p>`
    : "";

  return `
    <div style="background:#eff6ff;padding:24px;font-family:Arial,sans-serif;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:18px;padding:32px;border:1px solid #dbeafe;">
        <p style="margin:0 0 12px;color:#2563eb;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">TJPing Reminder</p>
        <h1 style="margin:0 0 12px;color:#0f172a;font-size:28px;line-height:1.3;">${escapeHtml(reminder.title)}</h1>
        <p style="margin:0 0 16px;color:#475569;line-height:1.7;">
          Mốc nhắc hiện tại: <strong>${stepLabel}</strong>
        </p>
        ${contentHtml}
        <div style="border-radius:14px;background:#eff6ff;padding:16px;">
          <p style="margin:0;color:#1e293b;font-weight:700;">Thời gian gốc</p>
          <p style="margin:8px 0 0;color:#334155;">${remindAtLabel}</p>
        </div>
      </div>
    </div>
  `;
}

export function buildReminderEmailSubject({
  reminder,
  stepType,
}: {
  reminder: DeliveryReminder;
  stepType: ReminderStepType;
}) {
  return `[TJPing] ${mapStepTypeLabel(stepType)} - ${reminder.title}`;
}

export function buildReminderTelegramText({
  reminder,
  stepType,
}: {
  reminder: DeliveryReminder;
  stepType: ReminderStepType;
}) {
  const lines = [
    `<b>${escapeHtml(reminder.title)}</b>`,
    reminder.content.trim()
      ? `Nội dung: ${escapeHtml(reminder.content.trim())}`
      : "",
    `(${escapeHtml(mapStepTypeLabel(stepType))} - ${escapeHtml(
      formatReminderDateTime(reminder.remindAt),
    )})`,
  ].filter(Boolean);

  return lines.join("\n\n");
}

export async function deliverReminderChannel({
  channel,
  reminder,
  settings,
  stepType,
}: {
  channel: ReminderChannel;
  reminder: DeliveryReminder;
  settings: NotificationChannelSettings | null;
  stepType: ReminderStepType;
}) {
  if (channel === "email") {
    const emailAddress = settings?.emailEnabled
      ? settings.emailAddress.trim()
      : "";

    if (!emailAddress) {
      throw new Error("Kênh Email chưa được cấu hình địa chỉ nhận.");
    }

    if (
      !process.env.GMAIL_OAUTH_USER ||
      !process.env.GMAIL_CLIENT_ID ||
      !process.env.GMAIL_CLIENT_SECRET ||
      !process.env.GMAIL_REFRESH_TOKEN
    ) {
      throw new Error("Thiếu cấu hình Gmail OAuth2.");
    }

    await sendMail({
      to: emailAddress,
      subject: buildReminderEmailSubject({ reminder, stepType }),
      html: renderReminderEmailHtml({ reminder, stepType }),
    });

    return { providerMessageId: null };
  }

  const chatId = settings?.telegramEnabled
    ? settings.telegramChatId.trim() || settings.telegramUsername.trim()
    : "";

  if (!chatId) {
    throw new Error("Kênh Telegram chưa có chat ID hoặc username.");
  }

  const result = await sendTelegramMessage({
    chatId,
    text: buildReminderTelegramText({ reminder, stepType }),
    parseMode: "HTML",
  });

  return { providerMessageId: result.messageId };
}

export function getNextOccurrence(
  currentIsoDate: string,
  repeatType: ReminderRepeatType,
  now = new Date(),
  weeklyDays: number[] = [],
) {
  let next = new Date(currentIsoDate);

  if (repeatType === "once") {
    return next.toISOString();
  }

  do {
    next = addRepeatInterval(next, repeatType, weeklyDays);
  } while (next.getTime() <= now.getTime());

  return next.toISOString();
}

function addRepeatInterval(
  dateValue: Date,
  repeatType: ReminderRepeatType,
  weeklyDays: number[],
) {
  const next = new Date(dateValue);

  if (repeatType === "daily") {
    next.setDate(next.getDate() + 1);
    return next;
  }

  if (repeatType === "weekly") {
    next.setDate(next.getDate() + 7);
    return next;
  }

  if (repeatType === "monthly") {
    const year = next.getUTCFullYear();
    const month = next.getUTCMonth();
    const day = next.getUTCDate();
    const hour = next.getUTCHours();
    const minute = next.getUTCMinutes();
    const second = next.getUTCSeconds();
    const ms = next.getUTCMilliseconds();

    const targetMonth = month + 1;
    const targetYear = year + Math.floor(targetMonth / 12);
    const normalizedMonth = targetMonth % 12;
    const lastDayOfMonth = new Date(
      Date.UTC(targetYear, normalizedMonth + 1, 0),
    ).getUTCDate();

    return new Date(
      Date.UTC(
        targetYear,
        normalizedMonth,
        Math.min(day, lastDayOfMonth),
        hour,
        minute,
        second,
        ms,
      ),
    );
  }

  if (repeatType === "custom_weekly") {
    return getNextCustomWeeklyDate(next, weeklyDays);
  }

  return next;
}

function getNextCustomWeeklyDate(dateValue: Date, weeklyDays: number[]) {
  const normalizedWeeklyDays = normalizeWeeklyDays(weeklyDays);

  if (normalizedWeeklyDays.length === 0) {
    const fallback = new Date(dateValue);
    fallback.setUTCDate(fallback.getUTCDate() + 7);
    return fallback;
  }

  const currentWeekday = getBangkokWeekday(dateValue);

  for (const weekday of normalizedWeeklyDays) {
    if (weekday > currentWeekday) {
      return addUtcDays(dateValue, weekday - currentWeekday);
    }
  }

  return addUtcDays(
    dateValue,
    7 - currentWeekday + normalizedWeeklyDays[0],
  );
}

function normalizeWeeklyDays(weeklyDays: number[]) {
  return [...new Set(weeklyDays)]
    .filter((day) => Number.isInteger(day) && day >= 1 && day <= 7)
    .sort((left, right) => left - right);
}

function getBangkokWeekday(dateValue: Date) {
  const bangkokDate = new Date(dateValue.getTime() + 7 * 60 * 60 * 1000);
  const utcDay = bangkokDate.getUTCDay();

  return utcDay === 0 ? 7 : utcDay;
}

function addUtcDays(dateValue: Date, days: number) {
  const next = new Date(dateValue);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
