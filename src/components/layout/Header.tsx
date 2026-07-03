"use client";

import Link from "next/link";
import { Bell, Menu, Plus } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
  subtitle?: string;
}

export default function Header({ onMenuToggle, title, subtitle }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-4 px-4 py-4 sm:px-6"
      style={{
        background: "rgba(6, 17, 31, 0.84)",
        borderBottom: "1px solid rgba(96,165,250,0.12)",
        backdropFilter: "blur(20px)",
      }}
    >
      <button
        onClick={onMenuToggle}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-colors lg:hidden"
        style={{
          background: "rgba(37,99,235,0.1)",
          border: "1px solid rgba(96,165,250,0.18)",
          color: "rgba(234,242,255,0.78)",
        }}
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold leading-tight text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-slate-400">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/reminders"
          className="hidden h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold text-sky-100 transition-colors hover:bg-sky-500/10 sm:flex"
          style={{ borderColor: "rgba(96,165,250,0.18)" }}
        >
          <Plus className="h-4 w-4" />
          Tạo nhắc
        </Link>
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
          style={{
            background: "rgba(37,99,235,0.1)",
            border: "1px solid rgba(96,165,250,0.18)",
            color: "rgba(234,242,255,0.78)",
          }}
          aria-label="Thông báo"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-sky-300" />
        </button>
      </div>
    </header>
  );
}
