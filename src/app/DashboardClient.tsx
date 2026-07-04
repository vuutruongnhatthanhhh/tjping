"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BellRing,
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Mail,
  MessageCircle,
  Radio,
  Send,
  Timer,
  XCircle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ButtonSpinner from "@/components/ui/ButtonSpinner";
import StatCard from "@/components/ui/StatCard";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

export interface DashboardReminder {
  id: string;
  title: string;
  content: string;
  remindAt: string;
  repeatType: string;
  weeklyDays: number[];
  status: string;
  channels: string[];
}

interface DashboardClientProps {
  userEmail?: string;
  userName?: string;
  reminders: DashboardReminder[];
  isDemo?: boolean;
  telegramConfigured?: boolean;
}

interface DemoReminder {
  title: string;
  description: string;
  date: string;
  time: string;
  repeat: string;
  channels: string[];
}

const reminderSteps = [
  { label: "Trước 1 ngày", time: "01/07/2026 09:00", status: "sent" },
  { label: "Trước 1 giờ", time: "02/07/2026 08:00", status: "pending" },
  { label: "Đúng giờ", time: "02/07/2026 09:00", status: "pending" },
];

const logs = [
  {
    title: "Họp demo TJPing",
    channel: "Email",
    time: "01/07/2026 09:00",
    status: "sent",
  },
  {
    title: "Gia hạn hợp đồng",
    channel: "Telegram",
    time: "01/07/2026 10:15",
    status: "pending",
  },
  {
    title: "Nhắc khách thanh toán",
    channel: "Email",
    time: "30/06/2026 16:40",
    status: "failed",
  },
];

const upcomingReminders: DemoReminder[] = [
  {
    title: "Gọi lại khách hàng enterprise",
    description: "Kiểm tra nhu cầu triển khai Telegram bot riêng.",
    date: "02/07/2026",
    time: "09:00",
    repeat: "Hằng tuần",
    channels: ["Email", "Telegram"],
  },
  {
    title: "Gửi báo cáo chiến dịch",
    description: "Tổng hợp số liệu và gửi cho nhóm vận hành.",
    date: "03/07/2026",
    time: "14:30",
    repeat: "Một lần",
    channels: ["Email"],
  },
  {
    title: "Kiểm tra bot tạo nhắc nhanh",
    description: "Chat với bot: nhắc tôi họp lúc 8h sáng mai.",
    date: "04/07/2026",
    time: "08:00",
    repeat: "Hằng ngày",
    channels: ["Telegram"],
  },
];

export default function DashboardClient({
  userEmail,
  userName,
  reminders,
  isDemo = false,
  telegramConfigured = true,
}: DashboardClientProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [reminderItems, setReminderItems] = useState(reminders);
  const displayReminders = reminderItems.length > 0 ? reminderItems : upcomingReminders;
  const pendingCount = reminderItems.filter((item) => item.status === "pending").length;
  const sentCount = reminderItems.filter((item) => item.status === "sent").length;
  const failedCount = reminderItems.filter((item) => item.status === "failed").length;
  const today = formatDate(new Date());

  useEffect(() => {
    if (isDemo) {
      return;
    }

    const supabase = createClient();

    const verifySession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.replace("/login");
      }
    };

    void verifySession();

    const handlePageShow = () => {
      void verifySession();
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [isDemo]);

  useEffect(() => {
    setReminderItems(reminders);
  }, [reminders]);

  const createReminder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage("");
    setFormError("");
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/reminders", {
      method: "POST",
      body: formData,
    });
    const result = (await response.json()) as { error?: string; id?: string };

    if (!response.ok) {
      setFormError(result.error || "Không thể tạo lời nhắc.");
      setIsSaving(false);
      return;
    }

    setReminderItems((current) =>
      sortDashboardReminders([
        buildDashboardReminder(formData, result.id || crypto.randomUUID()),
        ...current,
      ]),
    );
    setFormMessage("Đã tạo lời nhắc và lưu theo tài khoản hiện tại.");
    setIsSaving(false);
    event.currentTarget.reset();
    router.refresh();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-mystic-dark">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute right-[8%] top-[-16%] h-[520px] w-[520px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #2563EB, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-18%] left-[8%] h-[420px] w-[420px] rounded-full opacity-14 blur-3xl"
          style={{ background: "radial-gradient(circle, #06B6D4, transparent 70%)" }}
        />
      </div>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userEmail={userEmail}
        userName={userName}
      />

      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOpen(true)}
          title="Tổng quan nhắc việc"
          subtitle={`Hôm nay ${today} · Email và Telegram đã sẵn sàng`}
        />

        <div
          data-dashboard-scroll-root
          className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar sm:px-6"
        >
          <section className="mb-6 animate-fade-in">
            {isDemo && (
              <div className="mb-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Chưa cấu hình Supabase env nên đang hiển thị dữ liệu demo. Thêm
                `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`
                để bật đăng nhập và dữ liệu theo tài khoản.
              </div>
            )}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
                  TJPing automation
                </p>
                <h2 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Quản lý lời nhắc đa kênh trong một dashboard gọn gàng.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  Tạo lịch nhắc, chọn Email hoặc Telegram, theo dõi từng bước gửi
                  và xem log để biết thông báo đã được gửi hay chưa.
                </p>
              </div>
              <button className="btn-primary w-full sm:w-auto">
                <BellRing className="h-4 w-4" />
                Tạo lời nhắc mới
              </button>
            </div>
          </section>

          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Lời nhắc chờ gửi"
              value={isDemo ? "24" : String(pendingCount)}
              subtitle="Đang chờ gửi"
              icon={<Clock3 className="h-6 w-6" />}
              tone="blue"
            />
            <StatCard
              title="Đã gửi hôm nay"
              value={isDemo ? "128" : String(sentCount)}
              subtitle="Email và Telegram"
              icon={<CheckCircle2 className="h-6 w-6" />}
              tone="green"
            />
            <StatCard
              title="Telegram nhanh"
              value="36"
              subtitle="Tạo từ bot riêng"
              icon={<Bot className="h-6 w-6" />}
              tone="cyan"
            />
            <StatCard
              title="Gửi lỗi"
              value={isDemo ? "3" : String(failedCount)}
              subtitle="Cần kiểm tra lại"
              icon={<AlertTriangle className="h-6 w-6" />}
              tone="red"
            />
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="glass-card rounded-2xl p-5 xl:col-span-3">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Tạo lời nhắc nhanh
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Form mẫu cho tiêu đề, nội dung, thời gian, kênh và lặp lại.
                  </p>
                </div>
                <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200">
                  dd/mm/yyyy
                </span>
              </div>

              {formError && (
                <div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {formError}
                </div>
              )}
              {formMessage && (
                <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {formMessage}
                </div>
              )}

              <form onSubmit={createReminder}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Tiêu đề
                  </span>
                  <input
                    name="title"
                    className="input-mystic"
                    defaultValue="Họp triển khai TJPing"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Ngày bắt đầu
                  </span>
                  <input
                    name="date"
                    className="input-mystic"
                    inputMode="numeric"
                    placeholder="dd/mm/yyyy"
                    defaultValue="02/07/2026"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Nội dung
                  </span>
                  <textarea
                    name="content"
                    className="input-mystic min-h-24 resize-none"
                    defaultValue="Chuẩn bị nội dung demo automation đa kênh và kiểm tra Telegram bot trước giờ họp."
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Thời gian
                  </span>
                  <input name="time" className="input-mystic" defaultValue="09:00" />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Lặp lại
                  </span>
                  <select name="repeatType" className="input-mystic">
                    <option value="once">Một lần</option>
                    <option value="daily">Hằng ngày</option>
                    <option value="weekly">Hằng tuần</option>
                    <option value="monthly">Hằng tháng</option>
                  </select>
                </label>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input type="hidden" name="channels" value="email" />
                {telegramConfigured && (
                  <input type="hidden" name="channels" value="telegram" />
                )}
                <ChannelToggle
                  icon={<Mail className="h-5 w-5" />}
                  title="Email"
                  description="Gửi qua hộp thư đã xác thực"
                  active
                />
                <ChannelToggle
                  icon={<MessageCircle className="h-5 w-5" />}
                  title="Telegram"
                  description={
                    telegramConfigured
                      ? "Gửi qua bot riêng của TJPing"
                      : "Chưa cấu hình Telegram"
                  }
                  active={telegramConfigured}
                  disabled={!telegramConfigured}
                  helperAction={
                    !telegramConfigured
                      ? {
                          label: "?",
                          href: "https://example.com/telegram-setup",
                          title: "Xem hướng dẫn cấu hình Telegram",
                        }
                      : undefined
                  }
                />
              </div>
              <button
                type="submit"
                disabled={isSaving || isDemo}
                className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving && <ButtonSpinner />}
                Lưu lời nhắc
              </button>
              </form>
            </div>

            <div className="glass-card rounded-2xl p-5 xl:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Nhắc nhiều bước
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Trước 1 ngày, trước 1 giờ và đúng giờ.
                  </p>
                </div>
                <Timer className="h-5 w-5 text-sky-300" />
              </div>

              <div className="space-y-3">
                {reminderSteps.map((step) => (
                  <div
                    key={step.label}
                    className="flex items-center gap-3 rounded-xl border border-sky-400/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-sky-500/[0.12] text-sky-200">
                      <Radio className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {step.label}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {step.time}
                      </p>
                    </div>
                    <StatusBadge status={step.status} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="glass-card rounded-2xl p-5 xl:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">
                  Lời nhắc sắp tới
                </h3>
                <CalendarClock className="h-5 w-5 text-sky-300" />
              </div>

              <div className="space-y-3">
                {displayReminders.map((item) => {
                  const isSavedReminder = isDashboardReminder(item);
                  const date = isSavedReminder
                    ? formatDate(new Date(item.remindAt))
                    : item.date;
                  const time = isSavedReminder
                    ? new Intl.DateTimeFormat("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(item.remindAt))
                    : item.time;
                  const description =
                    isSavedReminder ? item.content : item.description;
                  const repeat =
                    isSavedReminder
                      ? mapRepeatType(item.repeatType, item.weeklyDays)
                      : item.repeat;
                  const channels = item.channels;

                  return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-sky-400/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-5 text-slate-400">
                          {description}
                        </p>
                      </div>
                      <div className="flex-shrink-0 rounded-xl border border-sky-400/10 bg-sky-500/10 px-3 py-2 text-sm text-sky-100">
                        {date} · {time}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                        {repeat}
                      </span>
                      {channels.map((channel) => (
                        <span
                          key={channel}
                          className="rounded-full bg-sky-500/10 px-3 py-1 text-xs text-sky-200"
                        >
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Log gửi</h3>
                <Send className="h-5 w-5 text-sky-300" />
              </div>
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={`${log.title}-${log.time}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sky-500/[0.12] text-sky-200">
                      {log.channel === "Email" ? (
                        <Mail className="h-4 w-4" />
                      ) : (
                        <MessageCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {log.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {log.channel} · {log.time}
                      </p>
                    </div>
                    <StatusBadge status={log.status} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function isDashboardReminder(
  item: DashboardReminder | DemoReminder,
): item is DashboardReminder {
  return "remindAt" in item;
}

function mapRepeatType(value: string, weeklyDays: number[] = []) {
  const repeatMap: Record<string, string> = {
    once: "Một lần",
    daily: "Hằng ngày",
    weekly: "Hằng tuần",
    monthly: "Hằng tháng",
  };

  repeatMap.custom_weekly = formatWeeklyDaysLabel(weeklyDays);
  return repeatMap[value] || value;
}

function formatWeeklyDaysLabel(weeklyDays: number[]) {
  if (weeklyDays.length === 0) {
    return "Theo các thứ trong tuần";
  }

  return weeklyDays.map(mapWeekdayLabel).join(", ");
}

function mapWeekdayLabel(day: number) {
  const labels: Record<number, string> = {
    1: "Thứ 2",
    2: "Thứ 3",
    3: "Thứ 4",
    4: "Thứ 5",
    5: "Thứ 6",
    6: "Thứ 7",
    7: "Chủ nhật",
  };

  return labels[day] || `Thứ ${day}`;
}

function ChannelToggle({
  icon,
  title,
  description,
  active,
  disabled,
  helperAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active?: boolean;
  disabled?: boolean;
  helperAction?: {
    label: string;
    href: string;
    title: string;
  };
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:bg-sky-500/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
      style={{
        borderColor: active ? "rgba(96,165,250,0.28)" : "rgba(96,165,250,0.12)",
        background: active ? "rgba(37,99,235,0.1)" : "rgba(255,255,255,0.03)",
      }}
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-sky-500/[0.14] text-sky-200">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <span>{title}</span>
          {helperAction ? (
            <a
              href={helperAction.href}
              target="_blank"
              rel="noreferrer"
              title={helperAction.title}
              onClick={(event) => event.stopPropagation()}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-sky-300/20 bg-sky-500/10 text-[11px] font-bold text-sky-200 transition-colors hover:bg-sky-500/20"
            >
              {helperAction.label}
            </a>
          ) : null}
        </span>
        <span className="mt-1 block text-xs text-slate-400">{description}</span>
      </span>
      <span className="h-5 w-5 rounded-full border border-sky-300 bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.45)]" />
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config =
    status === "sent"
      ? {
          label: "Đã gửi",
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
        }
      : status === "failed"
        ? {
            label: "Lỗi",
            icon: <XCircle className="h-3.5 w-3.5" />,
            className: "border-red-400/20 bg-red-500/10 text-red-300",
          }
        : {
            label: "Chờ gửi",
            icon: <Clock3 className="h-3.5 w-3.5" />,
            className: "border-sky-400/20 bg-sky-500/10 text-sky-200",
          };

  return (
    <span
      className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}


function buildDashboardReminder(formData: FormData, id: string): DashboardReminder {
  return {
    id,
    title: String(formData.get("title") || ""),
    content: String(formData.get("content") || ""),
    remindAt: parseDashboardDateTime(
      String(formData.get("date") || ""),
      String(formData.get("time") || ""),
    ),
    repeatType: String(formData.get("repeatType") || "once"),
    weeklyDays: formData.getAll("weeklyDays").map(Number).filter(Boolean),
    status: "pending",
    channels: formData.getAll("channels").map(mapDashboardChannel),
  };
}


function sortDashboardReminders(items: DashboardReminder[]) {
  return [...items].sort(
    (left, right) =>
      new Date(right.remindAt).getTime() - new Date(left.remindAt).getTime(),
  );
}

function parseDashboardDateTime(date: string, time: string) {
  const [day = "01", month = "01", year = "2026"] = date.split("/");
  const [hour = "00", minute = "00"] = time.split(":");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  ).toISOString();
}

function mapDashboardChannel(value: FormDataEntryValue) {
  const channel = String(value).toLowerCase();
  if (channel === "email") return "Email";
  if (channel === "telegram") return "Telegram";
  return String(value);
}
