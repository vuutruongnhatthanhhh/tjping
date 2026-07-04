import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";
import {
  buildTelegramHelpMessage,
  createTelegramReminder,
  deleteTelegramReminder,
  linkTelegramAccount,
  listTelegramReminders,
  parseReminderCommand,
  parseTelegramCommand,
} from "@/lib/telegramBot";

interface TelegramUpdate {
  message?: {
    text?: string;
    chat?: {
      id?: number;
    };
    from?: {
      username?: string;
    };
  };
}

function getWebhookSecret() {
  return process.env.TELEGRAM_WEBHOOK_SECRET || "";
}

async function replyToTelegram(chatId: string, text: string) {
  await sendTelegramMessage({
    chatId,
    text,
  });
}

export async function POST(request: Request) {
  const configuredSecret = getWebhookSecret();
  const headerSecret =
    request.headers.get("x-telegram-bot-api-secret-token") || "";

  if (configuredSecret && headerSecret !== configuredSecret) {
    return NextResponse.json({ error: "Invalid webhook secret." }, { status: 401 });
  }

  const update = (await request.json()) as TelegramUpdate;
  const message = update.message;
  const text = message?.text?.trim();
  const chatId = message?.chat?.id ? String(message.chat.id) : "";
  const username = message?.from?.username ? `@${message.from.username}` : "";

  if (!text || !chatId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const { command, args, rawArgs } = parseTelegramCommand(text);

    if (command === "/start") {
      const token = args[0];

      if (!token) {
        await replyToTelegram(chatId, buildTelegramHelpMessage());
        return NextResponse.json({ ok: true });
      }

      const result = await linkTelegramAccount({
        token,
        chatId,
        username,
      });

      await replyToTelegram(chatId, result.message);
      return NextResponse.json({ ok: true });
    }

    if (command === "/help") {
      await replyToTelegram(chatId, buildTelegramHelpMessage());
      return NextResponse.json({ ok: true });
    }

    if (command === "/remind") {
      const parsed = parseReminderCommand(rawArgs);

      if (!parsed) {
        await replyToTelegram(
          chatId,
          [
            "Cú pháp chưa đúng.",
            "Dùng: /remind dd/mm/yyyy HH:mm nội dung",
            "Ví dụ: /remind 05/07/2026 07:45 Họp team sale",
          ].join("\n"),
        );
        return NextResponse.json({ ok: true });
      }

      const result = await createTelegramReminder({
        chatId,
        title: parsed.title,
        remindAt: parsed.remindAt,
      });

      await replyToTelegram(chatId, result.message);
      return NextResponse.json({ ok: true });
    }

    if (command === "/list") {
      const result = await listTelegramReminders(chatId);
      await replyToTelegram(chatId, result.message);
      return NextResponse.json({ ok: true });
    }

    if (command === "/delete") {
      const reminderCode = args[0]?.trim();

      if (!reminderCode) {
        await replyToTelegram(
          chatId,
          "Dùng: /delete <8 ký tự đầu của ID reminder>",
        );
        return NextResponse.json({ ok: true });
      }

      const result = await deleteTelegramReminder({
        chatId,
        reminderCode,
      });
      await replyToTelegram(chatId, result.message);
      return NextResponse.json({ ok: true });
    }

    await replyToTelegram(chatId, buildTelegramHelpMessage());
    return NextResponse.json({ ok: true });
  } catch (error) {
    const messageText =
      error instanceof Error
        ? error.message
        : "Webhook Telegram gặp lỗi không xác định.";

    await replyToTelegram(
      chatId,
      `Không thể xử lý yêu cầu lúc này.\nChi tiết: ${messageText}`,
    );
    return NextResponse.json({ ok: true });
  }
}
