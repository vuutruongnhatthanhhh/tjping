"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = Date.now() + Math.floor(Math.random() * 1000);

      setToasts((current) => [...current, { id, message, tone }]);

      window.setTimeout(() => {
        dismissToast(id);
      }, 3200);
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[90] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const config =
            toast.tone === "success"
              ? {
                  icon: <CheckCircle2 className="h-5 w-5" />,
                  className:
                    "border-emerald-400/25 bg-emerald-500/12 text-emerald-100",
                }
              : toast.tone === "error"
                ? {
                    icon: <AlertTriangle className="h-5 w-5" />,
                    className: "border-red-400/25 bg-red-500/12 text-red-100",
                  }
                : {
                    icon: <Info className="h-5 w-5" />,
                    className: "border-sky-400/25 bg-sky-500/12 text-sky-100",
                  };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl ${config.className}`}
            >
              <span className="mt-0.5 flex-shrink-0">{config.icon}</span>
              <p className="min-w-0 flex-1 text-sm leading-6">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-current/70 transition-colors hover:bg-white/10 hover:text-current"
                aria-label="Đóng thông báo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
