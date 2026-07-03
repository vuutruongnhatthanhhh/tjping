"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import ButtonSpinner from "@/components/ui/ButtonSpinner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Vui lòng nhập email để nhận liên kết đặt lại mật khẩu.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(
          result.error ||
            "Không thể gửi email quên mật khẩu. Vui lòng thử lại.",
        );
        return;
      }

      setSuccess(
        "Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.",
      );
    } catch {
      setError("Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Quên mật khẩu</h1>
        <p className="mt-1 text-sm text-slate-400">
          Nhập email để nhận liên kết đặt lại mật khẩu.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="email@example.com"
            required
            maxLength={254}
            className="input-mystic"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? <ButtonSpinner className="h-5 w-5" /> : <Send className="h-4 w-4" />}
          Gửi email đặt lại mật khẩu
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-sky-300 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
