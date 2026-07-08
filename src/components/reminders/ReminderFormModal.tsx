"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";
import ButtonSpinner from "@/components/ui/ButtonSpinner";
import DateInput from "@/components/ui/DateInput";
import ModalOverlay from "@/components/ui/ModalOverlay";
import { useToast } from "@/components/ui/ToastProvider";

export interface ReminderFormState {
  title: string;
  content: string;
  date: string;
  time: string;
  repeatType: string;
  weeklyDays: number[];
  channels: string[];
  stepTypes: string[];
}

export interface ReminderFormSource {
  title: string;
  content: string;
  remindAt: string;
  repeatType: string;
  weeklyDays: number[];
  channels: string[];
  stepTypes: string[];
}

interface ReminderFormModalProps {
  formState: ReminderFormState;
  setFormState: Dispatch<SetStateAction<ReminderFormState>>;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
  isDemo?: boolean;
  telegramConfigured?: boolean;
  isEditing?: boolean;
  errorMessage?: string;
  errorToastKey?: number;
}

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

const weekdayOptions = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 7, label: "Chủ nhật" },
];

const TELEGRAM_SETUP_GUIDE_URL = "https://example.com/telegram-setup";

const hourOptions = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0"),
);

const minuteOptions = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0"),
);

export function createEmptyReminderForm(
  telegramConfigured = true,
): ReminderFormState {
  return {
    title: "",
    content: "",
    date: getTodayIsoDate(),
    time: "09:00",
    repeatType: "once",
    weeklyDays: [],
    channels: telegramConfigured ? ["email", "telegram"] : ["email"],
    stepTypes: ["on_time"],
  };
}

export function reminderToForm(reminder: ReminderFormSource): ReminderFormState {
  const parts = getBangkokDateTimeParts(reminder.remindAt);

  return {
    title: reminder.title,
    content: reminder.content,
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
    repeatType: reminder.repeatType,
    weeklyDays: reminder.weeklyDays,
    channels: reminder.channels.map(toChannelValue),
    stepTypes: reminder.stepTypes,
  };
}

export function formatVietnameseDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function getReminderFormError(formState: ReminderFormState) {
  if (!formState.title.trim()) {
    return "Vui lòng nhập tiêu đề.";
  }

  if (!formState.date || !formState.time) {
    return "Vui lòng chọn ngày và giờ nhắc.";
  }

  if (formState.channels.length === 0) {
    return "Vui lòng chọn ít nhất một kênh gửi.";
  }

  if (formState.stepTypes.length === 0) {
    return "Vui lòng chọn ít nhất một mốc nhắc.";
  }

  if (
    formState.repeatType === "custom_weekly" &&
    formState.weeklyDays.length === 0
  ) {
    return "Vui lòng chọn ít nhất một thứ trong tuần.";
  }

  if (
    formState.repeatType === "custom_weekly" &&
    !formState.weeklyDays.includes(getWeekdayFromIsoDate(formState.date))
  ) {
    return "Ngày bắt đầu phải thuộc các thứ trong tuần đã chọn.";
  }

  return null;
}

export default function ReminderFormModal({
  formState,
  setFormState,
  onClose,
  onSubmit,
  isSaving,
  isDemo = false,
  telegramConfigured = true,
  isEditing = false,
  errorMessage,
  errorToastKey,
}: ReminderFormModalProps) {
  const { showToast } = useToast();

  useEffect(() => {
    if (errorMessage) {
      showToast(errorMessage, "error");
    }
  }, [errorMessage, errorToastKey, showToast]);

  return (
    <ModalOverlay
      onClose={onClose}
      panelClassName="flex h-[88vh] w-full flex-col rounded-t-[28px] border border-sky-400/14 bg-[rgba(7,18,34,0.98)] sm:h-[720px] sm:max-w-2xl sm:rounded-[28px]"
      panelStyle={{
        boxShadow: "0 24px 80px rgba(0,0,0,0.48)",
      }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-sky-400/10 px-5 py-5 sm:px-6">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-white">
            {isEditing ? "Chỉnh sửa lời nhắc" : "Tạo lời nhắc mới"}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Điền thông tin, chọn lịch nhắc và tick các mốc cần gửi.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-sky-400/12 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/[0.06]"
        >
          Đóng
        </button>
      </div>

      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
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
                  Nội dung (không bắt buộc)
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
                  placeholder="Nhập nội dung lời nhắc nếu cần..."
                  disabled={isSaving || isDemo}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Ngày bắt đầu
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
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <select
                    className="input-mystic"
                    value={getTimePart(formState.time, "hour")}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        time: buildTimeValue(
                          event.target.value,
                          getTimePart(current.time, "minute"),
                        ),
                      }))
                    }
                    disabled={isSaving || isDemo}
                  >
                    {hourOptions.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm font-semibold text-slate-400">:</span>
                  <select
                    className="input-mystic"
                    value={getTimePart(formState.time, "minute")}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        time: buildTimeValue(
                          getTimePart(current.time, "hour"),
                          event.target.value,
                        ),
                      }))
                    }
                    disabled={isSaving || isDemo}
                  >
                    {minuteOptions.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                </div>
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
                  <option value="custom_weekly">Theo các thứ trong tuần</option>
                  <option value="monthly">Hằng tháng</option>
                </select>
              </label>
            </div>

            {formState.repeatType === "custom_weekly" ? (
              <div>
                <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Các thứ trong tuần
                </span>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {weekdayOptions.map((weekday) => (
                    <ChoiceCard
                      key={weekday.value}
                      title={weekday.label}
                      description="Lặp lại vào ngày này hằng tuần"
                      checked={formState.weeklyDays.includes(weekday.value)}
                      onClick={() =>
                        setFormState((current) => ({
                          ...current,
                          weeklyDays: toggleSelectedNumber(
                            current.weeklyDays,
                            weekday.value,
                          ),
                        }))
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Kênh gửi
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ChoiceCard
                  title="Email"
                  description="Gửi qua hộp thư đã xác thực"
                  checked={formState.channels.includes("email")}
                  onClick={() =>
                    setFormState((current) => ({
                      ...current,
                      channels: toggleSelectedValue(current.channels, "email"),
                    }))
                  }
                />
                <ChoiceCard
                  title="Telegram"
                  description={
                    telegramConfigured
                      ? "Gửi qua bot riêng của TJPing"
                      : "Chưa cấu hình Telegram"
                  }
                  checked={formState.channels.includes("telegram")}
                  disabled={!telegramConfigured}
                  onClick={() =>
                    setFormState((current) => ({
                      ...current,
                      channels: toggleSelectedValue(
                        current.channels,
                        "telegram",
                      ),
                    }))
                  }
                  helperAction={
                    !telegramConfigured
                      ? {
                          label: "?",
                          href: TELEGRAM_SETUP_GUIDE_URL,
                          title: "Xem hướng dẫn cấu hình Telegram",
                        }
                      : undefined
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
                  <ChoiceCard
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
              onClick={onClose}
              className="rounded-xl border border-sky-400/12 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.06]"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving || isDemo}
              className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <ButtonSpinner /> : null}
              {isEditing ? "Lưu cập nhật" : "Tạo lời nhắc"}
            </button>
          </div>
        </div>
      </form>
    </ModalOverlay>
  );
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function getTodayIsoDate() {
  return toIsoDate(new Date());
}

function getWeekdayFromIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utcDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return utcDay === 0 ? 7 : utcDay;
}

function getTimePart(value: string, part: "hour" | "minute") {
  const [hour = "09", minute = "00"] = value.split(":");
  return part === "hour" ? hour : minute;
}

function buildTimeValue(hour: string, minute: string) {
  return `${hour}:${minute}`;
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

function toggleSelectedNumber(values: number[], value: number) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value].sort((left, right) => left - right);
}

function ChoiceCard({
  title,
  description,
  checked,
  disabled = false,
  onClick,
  helperAction,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onClick: () => void;
  helperAction?: {
    label: string;
    href: string;
    title: string;
  };
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-between rounded-xl border p-4 text-left transition-all hover:bg-sky-500/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
      style={{
        borderColor: checked
          ? "rgba(96,165,250,0.28)"
          : "rgba(96,165,250,0.12)",
        background: checked ? "rgba(37,99,235,0.1)" : "rgba(255,255,255,0.03)",
      }}
    >
      <span className="min-w-0">
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
