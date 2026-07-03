"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bot,
  ChevronRight,
  Clock3,
  History,
  LayoutDashboard,
  LogOut,
  Send,
  Settings,
  X,
} from "lucide-react";
import Logo from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import AccountSettingsModal from "./AccountSettingsModal";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

const navItems = [
  { href: "/", label: "Tổng quan", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/reminders", label: "Lời nhắc", icon: <Clock3 className="h-5 w-5" /> },
  { href: "/channels", label: "Kênh gửi", icon: <Send className="h-5 w-5" /> },
  { href: "/telegram-bot", label: "Telegram bot", icon: <Bot className="h-5 w-5" /> },
  { href: "/delivery-logs", label: "Log gửi", icon: <History className="h-5 w-5" /> },
  { href: "/reports", label: "Báo cáo", icon: <BarChart3 className="h-5 w-5" /> },
  { href: "/settings", label: "Cài đặt", icon: <Settings className="h-5 w-5" /> },
];

export default function Sidebar({
  isOpen,
  onClose,
  userEmail,
  userName,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showAccountModal, setShowAccountModal] = useState(false);
  const userInitial = (userName || userEmail || "U")[0].toUpperCase();

  const openAccountModal = () => {
    setShowAccountModal(true);
    onClose();
  };

  return (
    <>
      <aside
        className="group/sidebar sticky top-0 hidden h-screen flex-shrink-0 overflow-hidden border-r bg-[rgba(7,18,34,0.95)] backdrop-blur-[20px] transition-[width] duration-300 ease-in-out lg:flex lg:w-16 hover:w-64"
        style={{ borderColor: "rgba(96,165,250,0.14)" }}
      >
        <div className="flex w-full flex-col">
          <div
            className="flex items-center border-b px-3 py-5"
            style={{ borderColor: "rgba(96,165,250,0.15)" }}
          >
            <Logo compact />
            <div className="ml-3 max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover/sidebar:max-w-[200px] group-hover/sidebar:opacity-100">
              <span className="text-lg font-bold text-white">TJ</span>
              <span className="text-lg font-bold text-sky-400">Ping</span>
            </div>
          </div>
          <SidebarNavCollapsed
            pathname={pathname}
            userEmail={userEmail}
            userName={userName}
            userInitial={userInitial}
            onOpenAccount={openAccountModal}
          />
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r backdrop-blur-[20px] transition-transform duration-300 ease-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          background: "rgba(7, 18, 34, 0.98)",
          borderColor: "rgba(96,165,250,0.16)",
          boxShadow: "20px 0 60px rgba(0,0,0,0.45)",
        }}
      >
        <SidebarContent
          pathname={pathname}
          onClose={onClose}
          userEmail={userEmail}
          userName={userName}
          userInitial={userInitial}
          onOpenAccount={openAccountModal}
        />
      </aside>

      {showAccountModal && (
        <AccountSettingsModal
          userEmail={userEmail}
          userName={userName}
          onSaved={() => router.refresh()}
          onClose={() => setShowAccountModal(false)}
        />
      )}
    </>
  );
}

function SidebarContent({
  pathname,
  onClose,
  userEmail,
  userName,
  userInitial,
  onOpenAccount,
}: {
  pathname: string;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
  userInitial: string;
  onOpenAccount: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center justify-between border-b px-4 py-5"
        style={{ borderColor: "rgba(96,165,250,0.15)" }}
      >
        <Logo />
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400"
          aria-label="Đóng menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn("sidebar-item group", isActive && "active")}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="h-4 w-4 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div
        className="border-t px-3 py-4"
        style={{ borderColor: "rgba(96,165,250,0.15)" }}
      >
        <button
          type="button"
          onClick={onOpenAccount}
          className="flex w-full items-center gap-3 rounded-xl border border-sky-400/10 bg-sky-500/[0.08] px-4 py-3 text-left"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/[0.16] text-sm font-bold text-sky-100">
            {userInitial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {userName || "Người dùng"}
            </p>
            <p className="truncate text-xs text-slate-400">
              {userEmail || "beta@tjping.vn"}
            </p>
          </div>
        </button>

        <Link
          href="/logout"
          className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </Link>
      </div>
    </div>
  );
}

function SidebarNavCollapsed({
  pathname,
  userEmail,
  userName,
  userInitial,
  onOpenAccount,
}: {
  pathname: string;
  userEmail?: string;
  userName?: string;
  userInitial: string;
  onOpenAccount: () => void;
}) {
  return (
    <>
      <nav className="flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-2 py-4 custom-scrollbar">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex cursor-pointer items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-300",
                "px-[14px] group-hover/sidebar:px-3",
                isActive
                  ? "bg-sky-500/20 text-sky-300 shadow-[inset_2px_0_0_#2563EB]"
                  : "text-slate-400 hover:bg-sky-500/10 hover:text-white",
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="w-0 flex-shrink-0 transition-[width] duration-300 group-hover/sidebar:w-3" />
              <span className="max-w-0 flex-1 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover/sidebar:max-w-[200px] group-hover/sidebar:opacity-100">
                {item.label}
              </span>
              {isActive && (
                <ChevronRight className="h-4 w-4 flex-shrink-0 opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      <div
        className="border-t px-2 py-4"
        style={{ borderColor: "rgba(96,165,250,0.15)" }}
      >
        <button
          type="button"
          onClick={onOpenAccount}
          className="w-full overflow-hidden rounded-xl border border-sky-400/10 bg-sky-500/[0.08]"
        >
          <div className="flex justify-center py-2 group-hover/sidebar:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/20 text-sm font-bold text-sky-100">
              {userInitial}
            </div>
          </div>
          <div className="hidden items-center gap-3 px-3 py-2 group-hover/sidebar:flex">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sm font-bold text-sky-100">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-white">
                {userName || "Người dùng"}
              </p>
              <p className="truncate text-xs text-slate-400">
                {userEmail || "beta@tjping.vn"}
              </p>
            </div>
          </div>
        </button>

        <Link
          href="/logout"
          className="mt-3 flex w-full items-center rounded-xl px-[14px] py-2.5 text-sm font-medium text-red-300 transition-all duration-300 hover:bg-red-500/10 group-hover/sidebar:px-3"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="w-0 flex-shrink-0 transition-[width] duration-300 group-hover/sidebar:w-3" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover/sidebar:max-w-[200px] group-hover/sidebar:opacity-100">
            Đăng xuất
          </span>
        </Link>
      </div>
    </>
  );
}
