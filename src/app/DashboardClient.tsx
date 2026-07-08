"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ReminderFormModal, {
  createEmptyReminderForm,
  formatVietnameseDate,
  getReminderFormError,
  type ReminderFormState,
} from "@/components/reminders/ReminderFormModal";
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

const demoReminders: DemoReminder[] = [
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formErrorToastKey, setFormErrorToastKey] = useState(0);
  const [reminderItems, setReminderItems] = useState(reminders);
  const [formState, setFormState] = useState<ReminderFormState>(() =>
    createEmptyReminderForm(telegramConfigured),
  );

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

  const pendingCount = reminderItems.filter(
    (item) => item.status === "pending",
  ).length;
  const sentCount = reminderItems.filter((item) => item.status === "sent").length;
  const failedCount = reminderItems.filter(
    (item) => item.status === "failed",
  ).length;
  const today = formatDate(new Date());

  const displayReminders = useMemo(() => {
    if (reminderItems.length === 0) {
      return isDemo ? demoReminders : [];
    }

    return [...reminderItems].sort(
      (left, right) =>
        new Date(left.remindAt).getTime() - new Date(right.remindAt).getTime(),
    );
  }, [isDemo, reminderItems]);

  const openCreateModal = () => {
    setFormError("");
    setFormState(createEmptyReminderForm(telegramConfigured));
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    if (isSaving) return;
    setShowCreateModal(false);
    setFormError("");
  };

  const showFormError = (message: string) => {
    setFormError(message);
    setFormErrorToastKey((current) => current + 1);
  };

  const createReminder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const validationError = getReminderFormError(formState);
    if (validationError) {
      showFormError(validationError);
      return;
    }

    setIsSaving(true);

    const formData = new FormData();
    formData.set("title", formState.title.trim());
    formData.set("content", formState.content.trim());
    formData.set("date", formatVietnameseDate(formState.date));
    formData.set("time", formState.time);
    formData.set("repeatType", formState.repeatType);
    formState.weeklyDays.forEach((weekday) =>
      formData.append("weeklyDays", String(weekday)),
    );
    formState.channels.forEach((channel) => formData.append("channels", channel));
    formState.stepTypes.forEach((stepType) =>
      formData.append("stepTypes", stepType),
    );

    const response = await fetch("/api/reminders", {
      method: "POST",
      body: formData,
    });

    const result = (await response.json()) as { error?: string; id?: string };

    if (!response.ok) {
      const message = result.error || "Không thể tạo lời nhắc.";
      showFormError(message);
      setIsSaving(false);
      return;
    }

    setReminderItems((current) =>
      sortDashboardReminders([
        buildDashboardReminder({
          id: result.id || crypto.randomUUID(),
          title: formState.title.trim(),
          content: formState.content.trim(),
          date: formState.date,
          time: formState.time,
          repeatType: formState.repeatType,
          weeklyDays: formState.weeklyDays,
          channels: formState.channels,
          status: "pending",
        }),
        ...current,
      ]),
    );

    setIsSaving(false);
    setShowCreateModal(false);
    setFormState(createEmptyReminderForm(telegramConfigured));
    router.refresh();
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
        userName={userName}
      />

      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOpen(true)}
          title="Tổng quan nhắc việc"
          subtitle={`Hôm nay ${today} · Email và Telegram đã sẵn sàng`}
        />

        <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <section className="mb-6 animate-fade-in">
            {isDemo ? (
              <div className="mb-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Chưa cấu hình Supabase env nên đang hiển thị dữ liệu demo. Thêm
                `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` để
                bật đăng nhập và dữ liệu theo tài khoản.
              </div>
            ) : null}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
                  TJPing automation
                </p>
                <h2 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Quản lý lời nhắc đa kênh trong một dashboard gọn gàng.
                </h2>
              </div>

              <button
                type="button"
                className="btn-primary w-full sm:w-auto"
                onClick={openCreateModal}
              >
                <BellRing className="h-4 w-4" />
                Tạo lời nhắc mới
              </button>
            </div>
          </section>

          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
              title="Gửi lỗi"
              value={isDemo ? "3" : String(failedCount)}
              subtitle="Cần kiểm tra lại"
              icon={<AlertTriangle className="h-6 w-6" />}
              tone="red"
            />
          </section>

          <section>
            <div className="glass-card rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">
                  Lời nhắc sắp tới
                </h3>
                <CalendarClock className="h-5 w-5 text-sky-300" />
              </div>

              <div className="space-y-3">
                {displayReminders.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-sky-400/10 bg-sky-500/5 px-4 py-6 text-sm text-slate-400">
                    Chưa có lời nhắc nào. Bấm &quot;Tạo lời nhắc mới&quot; để
                    thêm mới.
                  </div>
                ) : (
                  displayReminders.map((item) => {
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
                    const description = isSavedReminder
                      ? item.content
                      : item.description;
                    const repeat = isSavedReminder
                      ? mapRepeatType(item.repeatType, item.weeklyDays)
                      : item.repeat;

                    return (
                      <div
                        key={isSavedReminder ? item.id : item.title}
                        className="rounded-xl border border-sky-400/10 bg-white/[0.03] p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-white">
                              {item.title}
                            </p>
                            <p className="mt-1 text-sm leading-5 text-slate-400">
                              {description || "Không có nội dung."}
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
                          {item.channels.map((channel) => (
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
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {showCreateModal ? (
        <ReminderFormModal
          formState={formState}
          setFormState={setFormState}
          onClose={closeCreateModal}
          onSubmit={createReminder}
          isSaving={isSaving}
          isDemo={isDemo}
          telegramConfigured={telegramConfigured}
          errorMessage={formError}
          errorToastKey={formErrorToastKey}
        />
      ) : null}
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
    custom_weekly: formatWeeklyDaysLabel(weeklyDays),
  };

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

function buildDashboardReminder({
  id,
  title,
  content,
  date,
  time,
  repeatType,
  weeklyDays,
  channels,
  status,
}: {
  id: string;
  title: string;
  content: string;
  date: string;
  time: string;
  repeatType: string;
  weeklyDays: number[];
  channels: string[];
  status: string;
}): DashboardReminder {
  return {
    id,
    title,
    content,
    remindAt: new Date(`${date}T${time}:00+07:00`).toISOString(),
    repeatType,
    weeklyDays,
    status,
    channels: channels.map(mapChannelLabel),
  };
}

function sortDashboardReminders(items: DashboardReminder[]) {
  return [...items].sort(
    (left, right) =>
      new Date(left.remindAt).getTime() - new Date(right.remindAt).getTime(),
  );
}

function mapChannelLabel(value: string) {
  if (value === "email") return "Email";
  if (value === "telegram") return "Telegram";
  return value;
}
