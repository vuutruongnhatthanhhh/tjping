"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import type { AuthError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import ButtonSpinner from "@/components/ui/ButtonSpinner";
import { createClient } from "@/lib/supabase/client";

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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.get("fromRecovery") !== "1") {
      return;
    }

    const supabase = createClient();

    void (async () => {
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    })();
  }, [router]);

  const loginWithPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(getLoginErrorMessage(authError));
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const loginWithGoogle = async () => {
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
      setError("Không thể đăng nhập bằng Google. Vui lòng thử lại.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Đăng nhập</h1>
        <p className="mt-1 text-sm text-slate-400">
          Vào tài khoản để xem lời nhắc của riêng bạn.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={loginWithGoogle}
        disabled={loading || googleLoading}
        className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-sky-400/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white"
      >
        {googleLoading ? <ButtonSpinner /> : <GoogleIcon />}
        Đăng nhập bằng Google
      </button>

      <form onSubmit={loginWithPassword} className="space-y-4">
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
              placeholder="••••••••"
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

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-sky-300 hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="btn-primary w-full disabled:opacity-70"
        >
          {loading ? <ButtonSpinner /> : <LogIn className="h-4 w-4" />}
          Đăng nhập
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-semibold text-sky-300">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

function getLoginErrorMessage(error: AuthError) {
  const message = error.message.toLowerCase();

  if (
    message.includes("email not confirmed") ||
    message.includes("email not verified") ||
    message.includes("email_not_confirmed") ||
    message.includes("signup disabled") ||
    message.includes("confirmation")
  ) {
    return "Tài khoản này chưa xác thực email. Vui lòng kiểm tra hộp thư và bấm liên kết xác thực trước khi đăng nhập.";
  }

  return "Email hoặc mật khẩu không đúng. Vui lòng thử lại.";
}
