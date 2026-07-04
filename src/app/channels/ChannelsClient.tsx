"use client";

import { useState } from "react";
import {
  BellRing,
  ExternalLink,
  Mail,
  MessageCircle,
  Save,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ButtonSpinner from "@/components/ui/ButtonSpinner";
import StatCard from "@/components/ui/StatCard";
import { useToast } from "@/components/ui/ToastProvider";

export interface ChannelSettings {
  emailEnabled: boolean;
  emailAddress: string;
  telegramEnabled: boolean;
  telegramChatId: string;
  telegramUsername: string;
}

interface ChannelsClientProps {
  settings: ChannelSettings | null;
  fallbackEmail: string;
  userEmail?: string;
  botUsername: string;
  telegramConnected?: boolean;
  isDemo?: boolean;
}

export default function ChannelsClient({
  settings,
  fallbackEmail,
  userEmail,
  botUsername,
  telegramConnected = false,
  isDemo = false,
}: ChannelsClientProps) {
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(
    settings?.emailEnabled ?? true,
  );
  const [emailAddress, setEmailAddress] = useState(
    settings?.emailAddress || fallbackEmail || "",
  );
  const [telegramEnabled, setTelegramEnabled] = useState(
    settings?.telegramEnabled ?? false,
  );
  const [telegramChatId, setTelegramChatId] = useState(
    settings?.telegramChatId || "",
  );
  const [telegramUsername, setTelegramUsername] = useState(
    settings?.telegramUsername || "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingTelegramLink, setIsGeneratingTelegramLink] = useState(false);
  const [telegramStartCommand, setTelegramStartCommand] = useState("");
  const [telegramLinkExpiresAt, setTelegramLinkExpiresAt] = useState("");

  const activeChannels = Number(emailEnabled) + Number(telegramEnabled);
  const botHandle = botUsername.startsWith("@")
    ? botUsername
    : `@${botUsername}`;
  const guideUrl = "";

  const saveSettings = async () => {
    if (isDemo) {
      showToast("Cần cấu hình Supabase để lưu thật.", "error");
      return;
    }

    if (emailEnabled && !emailAddress.trim()) {
      showToast("Vui lòng nhập email nhận thông báo.", "error");
      return;
    }

    if (telegramEnabled && !telegramChatId.trim() && !telegramUsername.trim()) {
      showToast("Vui lòng nhập Telegram chat ID hoặc username.", "error");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/channels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailEnabled,
          emailAddress: emailAddress.trim(),
          telegramEnabled,
          telegramChatId: telegramChatId.trim(),
          telegramUsername: telegramUsername.trim(),
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        showToast(result.error || "Không thể lưu cấu hình kênh gửi.", "error");
        return;
      }

      showToast("Đã lưu cấu hình kênh gửi.", "success");
    } catch {
      showToast("Không thể kết nối để lưu cấu hình.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const openTelegramBot = () => {
    window.open(
      `https://t.me/${botHandle.replace(/^@/, "")}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const connectTelegramBot = async () => {
    if (isDemo) {
      showToast("Cần cấu hình Supabase để liên kết bot thật.", "error");
      return;
    }

    setIsGeneratingTelegramLink(true);

    try {
      const response = await fetch("/api/channels/telegram-link", {
        method: "POST",
      });
      const result = (await response.json()) as {
        error?: string;
        botUrl?: string;
        command?: string;
        expiresAt?: string;
      };

      if (!response.ok || !result.botUrl || !result.command || !result.expiresAt) {
        showToast(result.error || "Không thể tạo mã liên kết Telegram.", "error");
        return;
      }

      setTelegramStartCommand(result.command);
      setTelegramLinkExpiresAt(result.expiresAt);
      window.open(result.botUrl, "_blank", "noopener,noreferrer");
      showToast("Đã tạo mã liên kết. Mở bot và gửi lệnh /start để hoàn tất.", "success");
    } catch {
      showToast("Không thể tạo liên kết Telegram lúc này.", "error");
    } finally {
      setIsGeneratingTelegramLink(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-mystic-dark">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute right-[8%] top-[-16%] h-[520px] w-[520px] rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #2563EB, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-18%] left-[8%] h-[420px] w-[420px] rounded-full opacity-14 blur-3xl"
          style={{
            background: "radial-gradient(circle, #06B6D4, transparent 70%)",
          }}
        />
      </div>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userEmail={userEmail}
      />

      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOpen(true)}
          title="Kênh gửi"
          subtitle="Cấu hình nơi nhận thông báo qua Email và Telegram"
        />

        <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <section className="mb-6">
            {isDemo && (
              <div className="mb-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Chưa cấu hình biến môi trường Supabase nên trang đang ở chế độ
                demo.
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
                  TJPing channels
                </p>
                <h2 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Chọn nơi sẽ nhận thông báo nhắc việc của từng tài khoản.
                </h2>
              </div>
            </div>
          </section>

          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Kênh đang bật"
              value={String(activeChannels)}
              subtitle="Email và Telegram"
              icon={<BellRing className="h-6 w-6" />}
              tone="blue"
            />
            <StatCard
              title="Email nhận"
              value={emailEnabled ? "Bật" : "Tắt"}
              subtitle={emailAddress || "Chưa cấu hình"}
              icon={<Mail className="h-6 w-6" />}
              tone="green"
            />
            <StatCard
              title="Telegram nhận"
              value={telegramEnabled ? "Bật" : "Tắt"}
              subtitle={telegramUsername || telegramChatId || "Chưa cấu hình"}
              icon={<MessageCircle className="h-6 w-6" />}
              tone="cyan"
            />
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Cấu hình Email
                    </h3>
                  </div>
                  <Mail className="h-5 w-5 text-sky-300" />
                </div>

                <div className="space-y-4">
                  <ToggleRow
                    title="Bật gửi qua Email"
                    description="Khi bật, reminder sẽ được gửi tới email dưới đây."
                    checked={emailEnabled}
                    onToggle={() => setEmailEnabled((current) => !current)}
                  />

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Email nhận thông báo
                    </span>
                    <input
                      type="email"
                      className="input-mystic"
                      value={emailAddress}
                      onChange={(event) => setEmailAddress(event.target.value)}
                      placeholder="you@example.com"
                    />
                  </label>

                  <div className="rounded-xl border border-sky-400/10 bg-sky-500/8 px-4 py-3 text-sm text-slate-300">
                    Email tài khoản hiện tại:
                    <span className="ml-2 font-medium text-white">
                      {fallbackEmail || "Chưa có email"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Cấu hình Telegram
                    </h3>
                  </div>
                  <MessageCircle className="h-5 w-5 text-sky-300" />
                </div>

                <div className="space-y-4">
                  <ToggleRow
                    title="Bật gửi qua Telegram"
                    description="Khi bật, bot sẽ gửi thông báo tới chat ID hoặc username đã cấu hình."
                    checked={telegramEnabled}
                    onToggle={() => setTelegramEnabled((current) => !current)}
                  />

                  <div className="rounded-2xl border border-sky-400/12 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Bot Telegram của TJPing
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {botHandle}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Đây là bot dùng chung của hệ thống, người dùng không
                          cần sửa.
                        </p>
                        <p className="mt-3 text-sm text-slate-300">
                          Trạng thái liên kết:
                          <span className="ml-2 font-semibold text-white">
                            {telegramConnected ? "Đã kết nối" : "Chưa kết nối"}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={openTelegramBot}
                          className="inline-flex items-center gap-2 rounded-xl border border-sky-400/12 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-sky-100 transition-colors hover:bg-sky-500/10"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Mở bot
                        </button>
                        <button
                          type="button"
                          onClick={connectTelegramBot}
                          disabled={isGeneratingTelegramLink}
                          className="inline-flex items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-500/10 px-3 py-2 text-sm font-semibold text-sky-100 transition-colors hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isGeneratingTelegramLink ? <ButtonSpinner /> : null}
                          Kết nối nhanh
                        </button>
                      </div>
                    </div>
                  </div>

                  {telegramStartCommand ? (
                    <div className="rounded-2xl border border-sky-400/12 bg-sky-500/8 p-4 text-sm text-slate-200">
                      <p className="font-semibold text-white">
                        Bước liên kết nhanh
                      </p>
                      <p className="mt-2 leading-6 text-slate-300">
                        1. Bấm <span className="font-semibold text-white">Mở bot</span> hoặc
                        <span className="font-semibold text-white"> Kết nối nhanh</span>.
                      </p>
                      <p className="leading-6 text-slate-300">
                        2. Nếu bot chưa tự điền lệnh, gửi đúng dòng sau trong Telegram:
                      </p>
                      <div className="mt-3 rounded-xl border border-sky-400/12 bg-[rgba(7,18,34,0.7)] px-4 py-3 font-mono text-sm text-sky-100">
                        {telegramStartCommand}
                      </div>
                      <p className="mt-3 text-xs text-slate-400">
                        Mã liên kết hết hạn lúc {formatDateTimeLabel(telegramLinkExpiresAt)}.
                      </p>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Telegram chat ID
                      </span>
                      <input
                        className="input-mystic"
                        value={telegramChatId}
                        onChange={(event) =>
                          setTelegramChatId(event.target.value)
                        }
                        placeholder="123456789"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Telegram username
                      </span>
                      <input
                        className="input-mystic"
                        value={telegramUsername}
                        onChange={(event) =>
                          setTelegramUsername(event.target.value)
                        }
                        placeholder="@yourusername"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-5">
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      guideUrl || "about:blank",
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sky-400/12 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-sky-100 transition-colors hover:bg-sky-500/10"
                >
                  <ExternalLink className="h-4 w-4" />
                  Hướng dẫn nhanh
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="pointer-events-none fixed bottom-4 right-4 z-30 sm:bottom-6 sm:right-6">
          <button
            type="button"
            onClick={saveSettings}
            disabled={isSaving}
            className="pointer-events-auto inline-flex min-w-[160px] items-center justify-center gap-2 rounded-2xl border border-sky-300/25 bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(14,165,233,0.35)] transition-all hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <ButtonSpinner /> : <Save className="h-4 w-4" />}
            Lưu cấu hình
          </button>
        </div>
      </main>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-sky-400/10 bg-white/[0.03] px-4 py-4 text-left transition-colors hover:bg-sky-500/10"
    >
      <span>
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-400">
          {description}
        </span>
      </span>
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-sky-500" : "bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

function formatDateTimeLabel(value: string) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}
