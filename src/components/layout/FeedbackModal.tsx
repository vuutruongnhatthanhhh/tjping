"use client";

import { useState } from "react";
import { Loader2, Mail, MessageSquareText, Phone, Send, X } from "lucide-react";
import ModalOverlay from "@/components/ui/ModalOverlay";

interface FeedbackModalProps {
  userEmail?: string;
  onClose: () => void;
  showToast: (message: string, type?: "success" | "error") => void;
}

const PHONE_MAX_LENGTH = 20;
const MESSAGE_MAX_LENGTH = 1000;

export default function FeedbackModal({
  userEmail,
  onClose,
  showToast,
}: FeedbackModalProps) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    if (!trimmedPhone) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }

    if (!trimmedMessage) {
      setError("Vui lòng nhập nội dung góp ý.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: trimmedPhone,
          message: trimmedMessage,
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(result?.error || "Không thể gửi góp ý. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      showToast("Gửi góp ý thành công");
      setLoading(false);
      onClose();
    } catch {
      setError("Không thể gửi góp ý. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <ModalOverlay
      onClose={onClose}
      panelClassName="flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl sm:max-w-lg sm:rounded-3xl"
      panelStyle={{
        background: "rgba(7,18,34,0.97)",
        border: "1px solid rgba(96,165,250,0.18)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
      }}
    >
      <div
        className="flex items-center justify-between border-b px-6 py-5"
        style={{ borderColor: "rgba(96,165,250,0.12)" }}
      >
        <div>
          <p className="text-lg font-semibold text-white">Hòm thư góp ý</p>
          <p className="mt-1 text-sm text-slate-400">
            Gửi góp ý trực tiếp tới TJPing
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "rgba(226,232,240,0.55)",
          }}
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="custom-scrollbar flex-1 space-y-5 overflow-y-auto p-6"
      >
        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5",
            }}
          >
            {error}
          </div>
        )}

        <div
          className="space-y-4 rounded-2xl border p-4"
          style={{
            borderColor: "rgba(96,165,250,0.14)",
            background: "rgba(10,20,40,0.5)",
          }}
        >
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-sky-300" />
            <p className="text-sm font-semibold text-white">
              Thông tin phản hồi
            </p>
          </div>

          <div>
            <label
              className="mb-2 block text-xs font-semibold uppercase tracking-wide"
              style={{ color: "rgba(226,232,240,0.5)" }}
            >
              Email tài khoản
            </label>
            <div
              className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
              style={{
                borderColor: "rgba(96,165,250,0.12)",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(226,232,240,0.72)",
              }}
            >
              <Mail className="h-4 w-4 text-sky-300" />
              <span className="truncate">{userEmail || "Không có email"}</span>
            </div>
          </div>

          <div>
            <label
              className="mb-2 block text-xs font-semibold uppercase tracking-wide"
              style={{ color: "rgba(226,232,240,0.5)" }}
            >
              Số điện thoại
            </label>
            <div className="relative">
              <Phone
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: "rgba(226,232,240,0.4)" }}
              />
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  if (error) setError("");
                }}
                maxLength={PHONE_MAX_LENGTH}
                placeholder="Ví dụ: 0901234567"
                className="w-full rounded-xl border py-3 pl-11 pr-4 text-sm text-white outline-none"
                style={{
                  borderColor: "rgba(96,165,250,0.2)",
                  background: "rgba(5,13,24,0.8)",
                }}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-2 block text-xs font-semibold uppercase tracking-wide"
              style={{ color: "rgba(226,232,240,0.5)" }}
            >
              Nội dung góp ý
            </label>
            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                if (error) setError("");
              }}
              maxLength={MESSAGE_MAX_LENGTH}
              placeholder="Anh/chị góp ý giúp em phần nào cần cải thiện..."
              rows={7}
              className="w-full rounded-xl border px-4 py-3 text-sm text-white outline-none"
              style={{
                borderColor: "rgba(96,165,250,0.2)",
                background: "rgba(5,13,24,0.8)",
                resize: "vertical",
              }}
            />
            <div
              className="mt-2 text-right text-xs"
              style={{ color: "rgba(226,232,240,0.36)" }}
            >
              {message.trim().length}/{MESSAGE_MAX_LENGTH}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-4 py-3 text-sm font-semibold transition-colors"
            style={{
              background: "rgba(255,255,255,0.05)",
              borderColor: "rgba(255,255,255,0.1)",
              color: "rgba(226,232,240,0.6)",
            }}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Gửi góp ý
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}
