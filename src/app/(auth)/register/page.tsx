"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Mail, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Step = "form" | "sent";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path fill="#4285F4" d="M21.6 12.23c0-.67-.06-1.3-.18-1.92H12v3.63h5.36a4.59 4.59 0 0 1-1.99 3.02v2.5h3.22c1.88-1.73 3.01-4.28 3.01-7.23Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.22-2.5c-.9.61-2.05.98-3.41.98-2.61 0-4.82-1.76-5.61-4.13H3.08v2.58A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.91A6.01 6.01 0 0 1 6.06 12c0-.66.11-1.3.33-1.91V7.51H3.08A10 10 0 0 0 2 12c0 1.61.39 3.14 1.08 4.49l3.31-2.58Z" />
      <path fill="#EA4335" d="M12 5.97c1.47 0 2.79.51 3.83 1.52l2.87-2.87A9.7 9.7 0 0 0 12 2a10 10 0 0 0-8.92 5.51l3.31 2.58C7.18 7.73 9.39 5.97 12 5.97Z" />
    </svg>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const register = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? ((await response.json()) as { error?: string; success?: boolean })
        : null;

      if (!response.ok) {
        setError(
          data?.error ||
            "Không thể đăng ký. Vui lòng kiểm tra cấu hình email và Supabase.",
        );
        return;
      }

      setMessage(
        "Chúng tôi đã gửi liên kết xác nhận đến email của bạn. Hãy kiểm tra cả mục Spam nếu chưa thấy.",
      );
      setStep("sent");
    } catch {
      setError("Có lỗi xảy ra khi gửi yêu cầu đăng ký. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const registerWithGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    const supabase = createClient();
    const origin = window.location.origin;

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=/`,
      },
    });

    if (authError) {
      setError("Không thể đăng ký bằng Google. Vui lòng thử lại.");
      setGoogleLoading(false);
    }
  };

  if (step === "sent") {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-200">
          <Mail className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Kiểm tra hộp thư</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">{message}</p>
        <p className="mt-2 text-sm font-semibold text-sky-300">{email}</p>
        <Link href="/login" className="btn-primary mt-6 inline-flex">
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Đăng ký</h1>
        <p className="mt-1 text-sm text-slate-400">
          Tạo tài khoản để lưu lời nhắc theo từng người dùng.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={registerWithGoogle}
        disabled={loading || googleLoading}
        className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-sky-400/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white"
      >
        {googleLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <GoogleIcon />
        )}
        Đăng ký bằng Google
      </button>

      <form onSubmit={register} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input-mystic"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Mật khẩu
          </span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input-mystic pr-12"
              placeholder="Ít nhất 6 ký tự"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="btn-primary w-full disabled:opacity-70"
        >
          <UserPlus className="h-4 w-4" />
          {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-semibold text-sky-300">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
