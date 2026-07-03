"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

const MONTH_NAMES = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const DAY_NAMES = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function parseIso(iso: string) {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function toDisplay(iso: string) {
  const date = parseIso(iso);
  if (!date) return "";

  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function buildWeeks(year: number, month: number) {
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let day = 1 - firstDayOfWeek;

  while (day <= totalDays) {
    const week: (number | null)[] = [];

    for (let index = 0; index < 7; index += 1, day += 1) {
      week.push(day >= 1 && day <= totalDays ? day : null);
    }

    weeks.push(week);
  }

  return weeks;
}

export default function DateInput({
  value,
  onChange,
  required,
  disabled,
}: DateInputProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    const date = parseIso(value);
    return date ? date.getFullYear() : new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const date = parseIso(value);
    return date ? date.getMonth() : new Date().getMonth();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const date = parseIso(value);
    if (!date) return;

    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  const selected = parseIso(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const previousMonth = () => {
    if (viewMonth === 0) {
      setViewYear((current) => current - 1);
      setViewMonth(11);
      return;
    }

    setViewMonth((current) => current - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((current) => current + 1);
      setViewMonth(0);
      return;
    }

    setViewMonth((current) => current + 1);
  };

  const selectDay = (day: number) => {
    onChange(toIso(viewYear, viewMonth, day));
    setOpen(false);
  };

  const weeks = buildWeeks(viewYear, viewMonth);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        readOnly
        required={required}
        disabled={disabled}
        value={toDisplay(value)}
        onMouseDown={() => {
          if (!disabled) setOpen((current) => !current);
        }}
        onTouchEnd={(event) => {
          event.preventDefault();
          if (!disabled) setOpen((current) => !current);
        }}
        placeholder="dd/mm/yyyy"
        className="input-mystic cursor-pointer pr-11 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-300/70" />

      {open && !disabled && (
        <div
          className="absolute left-1/2 z-[70] mt-2 w-72 -translate-x-1/2 overflow-hidden rounded-2xl border"
          style={{
            background: "rgba(6,17,31,0.98)",
            borderColor: "rgba(96,165,250,0.22)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
          }}
        >
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: "rgba(96,165,250,0.14)" }}
          >
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                previousMonth();
              }}
              onTouchEnd={(event) => {
                event.preventDefault();
                previousMonth();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-sky-500/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                nextMonth();
              }}
              onTouchEnd={(event) => {
                event.preventDefault();
                nextMonth();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-sky-500/10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {DAY_NAMES.map((day) => (
              <div
                key={day}
                className="py-1 text-center text-xs font-semibold text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="space-y-0.5 px-3 pb-3">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7">
                {week.map((day, dayIndex) => {
                  if (!day) return <div key={dayIndex} />;

                  const currentDate = new Date(viewYear, viewMonth, day);
                  const isSelected =
                    selected &&
                    currentDate.toDateString() === selected.toDateString();
                  const isToday =
                    currentDate.toDateString() === today.toDateString();

                  return (
                    <button
                      key={dayIndex}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        selectDay(day);
                      }}
                      onTouchEnd={(event) => {
                        event.preventDefault();
                        selectDay(day);
                      }}
                      className="flex h-9 items-center justify-center rounded-xl text-sm transition-all"
                      style={{
                        background: isSelected
                          ? "linear-gradient(135deg,#2563eb,#0284c7)"
                          : isToday
                            ? "rgba(37,99,235,0.14)"
                            : "transparent",
                        color: isSelected
                          ? "#ffffff"
                          : isToday
                            ? "#93c5fd"
                            : "rgba(234,242,255,0.78)",
                        fontWeight: isSelected || isToday ? "600" : "400",
                        boxShadow: isSelected
                          ? "0 0 16px rgba(37,99,235,0.4)"
                          : "none",
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div
            className="flex justify-center border-t px-4 py-3"
            style={{ borderColor: "rgba(96,165,250,0.12)" }}
          >
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                const current = new Date();
                onChange(
                  toIso(
                    current.getFullYear(),
                    current.getMonth(),
                    current.getDate(),
                  ),
                );
                setOpen(false);
              }}
              onTouchEnd={(event) => {
                event.preventDefault();
                const current = new Date();
                onChange(
                  toIso(
                    current.getFullYear(),
                    current.getMonth(),
                    current.getDate(),
                  ),
                );
                setOpen(false);
              }}
              className="rounded-lg bg-sky-500/10 px-4 py-1.5 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-500/18"
            >
              Hôm nay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
