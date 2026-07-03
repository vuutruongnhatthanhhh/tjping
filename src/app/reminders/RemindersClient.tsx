"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Pencil,
  Plus,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import DateInput from "@/components/ui/DateInput";
import ModalOverlay from "@/components/ui/ModalOverlay";
import StatCard from "@/components/ui/StatCard";
import { useToast } from "@/components/ui/ToastProvider";
import { formatDate } from "@/lib/utils";

export interface ReminderItem {
  id: string;
  title: string;
  content: string;
  remindAt: string;
  repeatType: string;
  status: string;
  channels: string[];
  stepTypes: string[];
}

interface RemindersClientProps {
  userEmail?: string;
  userName?: string;
  reminders: ReminderItem[];
  isDemo?: boolean;
}

interface ReminderFormState {
  title: string;
  content: string;
  date: string;
  time: string;
  repeatType: string;
  channels: string[];
  stepTypes: string[];
}

const demoReminders: ReminderItem[] = [
  {
    id: "demo-1",
    title: "Họp triển khai tuần",
    content: "Nhắc trước 1 ngày, 1 giờ và đúng giờ qua Email và Telegram.",
    remindAt: "2026-07-04T09:00:00.000Z",
    repeatType: "weekly",
    status: "pending",
    channels: ["Email", "Telegram"],
    stepTypes: ["one_day_before", "one_hour_before", "on_time"],
  },
  {
    id: "demo-2",
    title: "Gửi báo cáo vận hành",
    content: "Kiểm tra log gửi và xác nhận trạng thái từng kênh.",
    remindAt: "2026-07-03T14:30:00.000Z",
    repeatType: "once",
    status: "sent",
    channels: ["Email"],
    stepTypes: ["on_time"],
  },
  {
    id: "demo-3",
    title: "Nhắc thanh toán đối tác",
    content: "Telegram bot riêng hỗ trợ tạo nhắc nhanh từ chat.",
    remindAt: "2026-07-05T08:00:00.000Z",
    repeatType: "monthly",
    status: "failed",
    channels: ["Telegram"],
    stepTypes: ["one_hour_before", "on_time"],
  },
];

const reminderStepOptions = [
  {
    value: "one_day_before",
    title: "Trước 1 ngày",
    description: "Gửi sớm để người dùng chuẩn bị.",
  },
  {
    value: "one_hour_before",
    title: "Trước 1 giờ",
    description: "Nhắc lại sát thời điểm diễn ra.",
  },
  {
    value: "on_time",
    title: "Đúng giờ",
    description: "Gửi nhắc cuối cùng theo lịch đã đặt.",
  },
];

const emptyForm = (): ReminderFormState => ({
  title: "",
  content: "",
  date: getTodayIsoDate(),
  time: "09:00",
  repeatType: "once",
  channels: ["email", "telegram"],
  stepTypes: ["on_time"],
});

export default function RemindersClient({
  userEmail,
  userName,
  reminders,
  isDemo = false,
}: RemindersClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderItem | null>(
    null,
  );
  const [deletingReminder, setDeletingReminder] = useState<ReminderItem | null>(
    null,
  );
  const [formState, setFormState] = useState<ReminderFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayReminders =
    isDemo && reminders.length === 0 ? demoReminders : reminders;
  const pendingCount = displayReminders.filter(
    (item) => item.status === "pending",
  ).length;
  const sentCount = displayReminders.filter(
    (item) => item.status === "sent",
  ).length;
  const failedCount = displayReminders.filter(
    (item) => item.status === "failed",
  ).length;

  const nextReminder = useMemo(() => {
    const sorted = [...displayReminders]
      .filter((item) => item.status === "pending")
      .sort(
        (left, right) =>
          new Date(left.remindAt).getTime() -
          new Date(right.remindAt).getTime(),
      );

    return sorted[0] || null;
  }, [displayReminders]);

  const openCreateModal = () => {
    setEditingReminder(null);
    setFormState(emptyForm());
    setShowFormModal(true);
  };

  const openEditModal = (reminder: ReminderItem) => {
    setEditingReminder(reminder);
    setFormState(reminderToForm(reminder));
    setShowFormModal(true);
  };

  const openDeleteModal = (reminder: ReminderItem) => {
    setDeletingReminder(reminder);
    setShowDeleteModal(true);
  };

  const closeFormModal = () => {
    if (isSaving) return;
    setShowFormModal(false);
    setEditingReminder(null);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setShowDeleteModal(false);
    setDeletingReminder(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.title.trim() || !formState.content.trim()) {
      showToast("Vui lòng nhập tiêu đề và nội dung.", "error");
      return;
    }

    if (!formState.date || !formState.time) {
      showToast("Vui lòng chọn ngày và giờ nhắc.", "error");
      return;
    }

    if (formState.channels.length === 0) {
      showToast("Vui lòng chọn ít nhất một kênh gửi.", "error");
      return;
    }

    if (formState.stepTypes.length === 0) {
      showToast("Vui lòng chọn ít nhất một mốc nhắc.", "error");
      return;
    }

    setIsSaving(true);

    if (editingReminder) {
      const response = await fetch(`/api/reminders/${editingReminder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formState.title.trim(),
          content: formState.content.trim(),
          date: formatVietnameseDate(formState.date),
          time: formState.time,
          repeatType: formState.repeatType,
          channels: formState.channels,
          stepTypes: formState.stepTypes,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        showToast(result.error || "Không thể cập nhật lời nhắc.", "error");
        setIsSaving(false);
        return;
      }

      showToast("Đã cập nhật lời nhắc.", "success");
    } else {
      const formData = new FormData();
      formData.set("title", formState.title.trim());
      formData.set("content", formState.content.trim());
      formData.set("date", formatVietnameseDate(formState.date));
      formData.set("time", formState.time);
      formData.set("repeatType", formState.repeatType);
      formState.channels.forEach((channel) =>
        formData.append("channels", channel),
      );
      formState.stepTypes.forEach((stepType) =>
        formData.append("stepTypes", stepType),
      );

      const response = await fetch("/api/reminders", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        showToast(result.error || "Không thể tạo lời nhắc.", "error");
        setIsSaving(false);
        return;
      }

      showToast("Đã tạo lời nhắc mới.", "success");
    }

    setIsSaving(false);
    setShowFormModal(false);
    setEditingReminder(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deletingReminder) return;

    setIsDeleting(true);

    const response = await fetch(`/api/reminders/${deletingReminder.id}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      showToast(result.error || "Không thể xóa lời nhắc.", "error");
      setIsDeleting(false);
      return;
    }

    setIsDeleting(false);
    setShowDeleteModal(false);
    setDeletingReminder(null);
    showToast("Đã xóa lời nhắc.", "success");
    router.refresh();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-mystic-dark">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
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
          title="Lời nhắc"
          subtitle="Quản lý danh sách lời nhắc bằng bảng và popup thao tác"
        />

        <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar sm:px-6">
          <section className="mb-6">
            {isDemo && (
              <div className="mb-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Chưa cấu hình Supabase env nên đang hiển thị dữ liệu demo.
              </div>
            )}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
                  TJPing reminders
                </p>
                <h2 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Danh sách lời nhắc
                </h2>
              </div>
              <button
                className="btn-primary w-full sm:w-auto"
                onClick={openCreateModal}
              >
                <Plus className="h-4 w-4" />
                Tạo lời nhắc
              </button>
            </div>
          </section>

          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Lời nhắc chờ gửi"
              value={String(pendingCount)}
              subtitle="Đang chờ gửi"
              icon={<Clock3 className="h-6 w-6" />}
              tone="blue"
            />
            <StatCard
              title="Đã gửi"
              value={String(sentCount)}
              subtitle="Email và Telegram"
              icon={<CheckCircle2 className="h-6 w-6" />}
              tone="green"
            />
            <StatCard
              title="Gửi lỗi"
              value={String(failedCount)}
              subtitle="Cần kiểm tra lại"
              icon={<AlertTriangle className="h-6 w-6" />}
              tone="red"
            />
          </section>

          <section className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
            <div className="glass-card rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Bảng lời nhắc
                  </h3>
                </div>
                <Send className="h-5 w-5 text-sky-300" />
              </div>

              <div className="hidden overflow-x-auto xl:block">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <colgroup>
                    <col className="w-[32%]" />
                    <col className="w-[18%]" />
                    <col className="w-[10%]" />
                    <col className="w-[14%]" />
                    <col className="w-[10%]" />
                    <col className="w-[11%]" />
                    <col className="w-[15%]" />
                  </colgroup>
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      <th className="px-4 py-2 font-semibold">Tiêu đề</th>
                      <th className="px-4 py-2 font-semibold">Thời gian</th>
                      <th className="px-4 py-2 font-semibold">Lặp lại</th>
                      <th className="px-4 py-2 font-semibold">Kênh</th>
                      <th className="px-4 py-2 font-semibold">Trạng thái</th>
                      <th className="px-4 py-2 font-semibold">Mốc nhắc</th>
                      <th className="px-4 py-2 text-right font-semibold">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayReminders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="rounded-2xl border border-sky-400/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-slate-400"
                        >
                          Chưa có lời nhắc nào. Bấm &quot;Tạo lời nhắc&quot; để
                          thêm mới.
                        </td>
                      </tr>
                    ) : (
                      displayReminders.map((item) => (
                        <tr key={item.id} className="text-sm text-slate-200">
                          <td className="rounded-l-2xl border border-r-0 border-sky-400/10 bg-white/[0.03] px-4 py-4 align-top">
                            <p className="text-[15px] font-semibold leading-6 text-white">
                              {item.title}
                            </p>
                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                              {item.content}
                            </p>
                          </td>
                          <td className="border-y border-sky-400/10 bg-white/[0.03] px-4 py-4 align-top text-slate-300">
                            <div className="inline-flex flex-col rounded-xl border border-sky-400/10 bg-sky-500/10 px-3 py-2">
                              <span className="text-xs uppercase tracking-[0.18em] text-sky-200/70">
                                Lịch nhắc
                              </span>
                              <span className="mt-1 inline-flex items-center gap-2 font-medium text-sky-50">
                                <CalendarClock className="h-4 w-4 text-sky-300" />
                                {formatDate(new Date(item.remindAt))}
                              </span>
                              <span className="mt-1 pl-6 text-sm text-sky-100/90">
                                {formatTime(item.remindAt)}
                              </span>
                            </div>
                          </td>
                          <td className="border-y border-sky-400/10 bg-white/[0.03] px-4 py-4 align-top">
                            <span className="inline-flex rounded-full bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-300">
                              {mapRepeatType(item.repeatType)}
                            </span>
                          </td>
                          <td className="border-y border-sky-400/10 bg-white/[0.03] px-4 py-4 align-top">
                            <div className="flex flex-wrap gap-2">
                              {item.channels.map((channel) => (
                                <span
                                  key={channel}
                                  className="rounded-full bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-200"
                                >
                                  {channel}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="border-y border-sky-400/10 bg-white/[0.03] px-4 py-4 align-top">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="border-y border-sky-400/10 bg-white/[0.03] px-4 py-4 align-top">
                            <div className="flex flex-wrap gap-2">
                              {item.stepTypes.map((stepType) => (
                                <span
                                  key={stepType}
                                  className="rounded-full bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-300"
                                >
                                  {mapStepType(stepType)}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="rounded-r-2xl border border-l-0 border-sky-400/10 bg-white/[0.03] px-4 py-4 align-top">
                            <div className="flex flex-col items-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="inline-flex min-w-[88px] items-center justify-center gap-2 rounded-xl border border-sky-400/12 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/10"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => openDeleteModal(item)}
                                className="inline-flex min-w-[88px] items-center justify-center gap-2 rounded-xl border border-red-400/15 bg-red-500/8 px-3 py-2 text-xs font-semibold text-red-200 transition-colors hover:bg-red-500/14"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 xl:hidden">
                {displayReminders.length === 0 ? (
                  <div className="rounded-2xl border border-sky-400/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-slate-400">
                    Chưa có lời nhắc nào. Bấm &quot;Tạo lời nhắc&quot; để thêm
                    mới.
                  </div>
                ) : (
                  displayReminders.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-sky-400/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-white">
                            {item.title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {item.content}
                          </p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <InfoBlock
                          label="Thời gian"
                          value={`${formatDate(new Date(item.remindAt))} · ${formatTime(item.remindAt)}`}
                        />
                        <InfoBlock
                          label="Lặp lại"
                          value={mapRepeatType(item.repeatType)}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Kênh
                          </p>
                          <div className="flex flex-wrap gap-2">
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

                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Mốc nhắc
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.stepTypes.map((stepType) => (
                              <span
                                key={stepType}
                                className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-slate-300"
                              >
                                {mapStepType(stepType)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/12 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-sky-100 transition-colors hover:bg-sky-500/10"
                        >
                          <Pencil className="h-4 w-4" />
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(item)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/15 bg-red-500/8 px-4 py-3 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/14"
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Lịch nhắc kế tiếp
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Tóm tắt mục gần nhất đang chờ gửi.
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-sky-300" />
              </div>

              {nextReminder ? (
                <div className="rounded-2xl border border-sky-400/10 bg-sky-500/10 p-4">
                  <p className="text-sm font-semibold text-white">
                    {nextReminder.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    {formatDate(new Date(nextReminder.remindAt))} ·{" "}
                    {formatTime(nextReminder.remindAt)}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {nextReminder.content}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-sky-400/10 bg-white/[0.03] p-4 text-sm text-slate-400">
                  Không có lời nhắc chờ gửi nào ở thời điểm hiện tại.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {showFormModal && (
        <ModalOverlay
          onClose={closeFormModal}
          panelClassName="flex h-[88vh] w-full flex-col rounded-t-[28px] border border-sky-400/14 bg-[rgba(7,18,34,0.98)] sm:h-[720px] sm:max-w-2xl sm:rounded-[28px]"
          panelStyle={{
            boxShadow: "0 24px 80px rgba(0,0,0,0.48)",
          }}
        >
          <div className="flex items-start justify-between gap-4 border-b border-sky-400/10 px-5 py-5 sm:px-6">
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-white">
                {editingReminder ? "Chỉnh sửa lời nhắc" : "Tạo lời nhắc mới"}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Điền thông tin, chọn lịch nhắc và tick các mốc cần gửi.
              </p>
            </div>
            <button
              type="button"
              onClick={closeFormModal}
              className="rounded-xl border border-sky-400/12 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/[0.06]"
            >
              Đóng
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 custom-scrollbar sm:px-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Tiêu đề
                    </span>
                    <input
                      className="input-mystic"
                      value={formState.title}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      placeholder="Họp triển khai TJPing"
                      disabled={isSaving || isDemo}
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Nội dung
                    </span>
                    <textarea
                      className="input-mystic min-h-28 resize-none"
                      value={formState.content}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          content: event.target.value,
                        }))
                      }
                      placeholder="Nhập nội dung lời nhắc..."
                      disabled={isSaving || isDemo}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Ngày nhắc
                    </span>
                    <DateInput
                      value={formState.date}
                      onChange={(value) =>
                        setFormState((current) => ({ ...current, date: value }))
                      }
                      required
                      disabled={isSaving || isDemo}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Giờ nhắc
                    </span>
                    <input
                      type="time"
                      className="input-mystic"
                      value={formState.time}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          time: event.target.value,
                        }))
                      }
                      disabled={isSaving || isDemo}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Lặp lại
                    </span>
                    <select
                      className="input-mystic"
                      value={formState.repeatType}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          repeatType: event.target.value,
                        }))
                      }
                      disabled={isSaving || isDemo}
                    >
                      <option value="once">Một lần</option>
                      <option value="daily">Hằng ngày</option>
                      <option value="weekly">Hằng tuần</option>
                      <option value="monthly">Hằng tháng</option>
                    </select>
                  </label>
                </div>

                <div>
                  <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Kênh gửi
                  </span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ChannelOption
                      title="Email"
                      description="Gửi qua hộp thư đã xác thực"
                      checked={formState.channels.includes("email")}
                      onClick={() =>
                        setFormState((current) => ({
                          ...current,
                          channels: toggleSelectedValue(
                            current.channels,
                            "email",
                          ),
                        }))
                      }
                    />
                    <ChannelOption
                      title="Telegram"
                      description="Gửi qua bot riêng của TJPing"
                      checked={formState.channels.includes("telegram")}
                      onClick={() =>
                        setFormState((current) => ({
                          ...current,
                          channels: toggleSelectedValue(
                            current.channels,
                            "telegram",
                          ),
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Mốc nhắc
                  </span>
                  <div className="grid grid-cols-1 gap-3">
                    {reminderStepOptions.map((option) => (
                      <ChannelOption
                        key={option.value}
                        title={option.title}
                        description={option.description}
                        checked={formState.stepTypes.includes(option.value)}
                        onClick={() =>
                          setFormState((current) => ({
                            ...current,
                            stepTypes: toggleSelectedValue(
                              current.stepTypes,
                              option.value,
                            ),
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-sky-400/10 px-5 py-4 sm:px-6">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="rounded-xl border border-sky-400/12 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.06]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isDemo}
                  className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving
                    ? "Đang lưu..."
                    : editingReminder
                      ? "Lưu cập nhật"
                      : "Tạo lời nhắc"}
                </button>
              </div>
            </div>
          </form>
        </ModalOverlay>
      )}

      {showDeleteModal && deletingReminder && (
        <ModalOverlay
          onClose={closeDeleteModal}
          panelClassName="w-full rounded-t-[28px] border border-red-400/14 bg-[rgba(7,18,34,0.98)] p-5 sm:max-w-md sm:rounded-[28px] sm:p-6"
          panelStyle={{
            boxShadow: "0 24px 80px rgba(0,0,0,0.48)",
          }}
        >
          <h3 className="text-xl font-bold text-white">Xóa lời nhắc</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Bạn có chắc muốn xóa lời nhắc &quot;{deletingReminder.title}&quot;?
            Hành động này sẽ xóa cả các bước nhắc đi kèm.
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeDeleteModal}
              className="rounded-xl border border-sky-400/12 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.06]"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isDemo}
              className="inline-flex items-center justify-center rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Đang xóa..." : "Xóa lời nhắc"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

function reminderToForm(reminder: ReminderItem): ReminderFormState {
  const parts = getBangkokDateTimeParts(reminder.remindAt);

  return {
    title: reminder.title,
    content: reminder.content,
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
    repeatType: reminder.repeatType,
    channels: reminder.channels.map(toChannelValue),
    stepTypes: reminder.stepTypes,
  };
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function formatVietnameseDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function getTodayIsoDate() {
  return toIsoDate(new Date());
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

function getBangkokDateTimeParts(value: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date(value));
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || "";

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
  };
}

function mapRepeatType(value: string) {
  const repeatMap: Record<string, string> = {
    once: "Một lần",
    daily: "Hằng ngày",
    weekly: "Hằng tuần",
    monthly: "Hằng tháng",
  };

  return repeatMap[value] || value;
}

function mapStepType(value: string) {
  const stepMap: Record<string, string> = {
    one_day_before: "Trước 1 ngày",
    one_hour_before: "Trước 1 giờ",
    on_time: "Đúng giờ",
  };

  return stepMap[value] || value;
}

function toChannelValue(channel: string) {
  if (channel.toLowerCase() === "email") return "email";
  if (channel.toLowerCase() === "telegram") return "telegram";
  return channel.toLowerCase();
}

function toggleSelectedValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function ChannelOption({
  title,
  description,
  checked,
  onClick,
}: {
  title: string;
  description: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between rounded-xl border p-4 text-left transition-all hover:bg-sky-500/10"
      style={{
        borderColor: checked
          ? "rgba(96,165,250,0.28)"
          : "rgba(96,165,250,0.12)",
        background: checked ? "rgba(37,99,235,0.1)" : "rgba(255,255,255,0.03)",
      }}
    >
      <span>
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="mt-1 block text-xs text-slate-400">{description}</span>
      </span>
      <span
        className={
          checked
            ? "h-5 w-5 rounded-full border border-sky-300 bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.45)]"
            : "h-5 w-5 rounded-full border border-slate-500 bg-transparent"
        }
      />
    </button>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sky-400/10 bg-sky-500/8 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-200">
        {value}
      </p>
    </div>
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
        : status === "canceled"
          ? {
              label: "Đã hủy",
              icon: <AlertTriangle className="h-3.5 w-3.5" />,
              className: "border-slate-400/20 bg-slate-500/10 text-slate-300",
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
