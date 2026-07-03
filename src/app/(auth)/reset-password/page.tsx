"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const passwordMaxLength = 128;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [canReset, setCanReset] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const initializeRecovery = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, ""),
      );
      const tokenHash =
        queryParams.get("token_hash") || hashParams.get("token_hash");
      const accessToken = hashParams.get("access_token");
      const type =
        queryParams.get("type") || hashParams.get("type") || "recovery";

      if (tokenHash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: (type === "recovery" ? "recovery" : type || "recovery") as
            | "recovery"
            | "email",
        });

        if (!isMounted) return;

        if (verifyError) {
          setError("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
          setCheckingSession(false);
          return;
        }

        setCanReset(true);
        setCheckingSession(false);
        if (window.location.hash) {
          window.history.replaceState({}, "", "/reset-password");
        }
        return;
      }

      if (accessToken) {
        const {
          data: { session: recoverySession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (sessionError || !recoverySession) {
          setError("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
          setCheckingSession(false);
          return;
        }

        setCanReset(true);
        setCheckingSession(false);
        if (window.location.hash) {
          window.history.replaceState({}, "", "/reset-password");
        }
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      setCanReset(Boolean(session));
      setCheckingSession(false);
    };

    void initializeRecovery();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setLoading(false);
      setError("Không thể cập nhật mật khẩu. Vui lòng thử lại.");
      return;
    }

    await supabase.auth.signOut();
    setLoading(false);
    setSuccess(
      "Đổi mật khẩu thành công. Hệ thống sẽ chuyển về trang đăng nhập.",
    );
    window.setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1600);
  };

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Đặt lại mật khẩu</h1>
        <p className="mt-1 text-sm text-slate-400">
          Nhập mật khẩu mới sau khi xác nhận qua email.
        </p>
      </div>

      {checkingSession ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="mt-4 text-sm text-slate-400">
            Đang kiểm tra liên kết đặt lại mật khẩu...
          </p>
        </div>
      ) : !canReset ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-white">
            Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-sky-300 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {success}
            </div>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Mật khẩu mới
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError("");
              }}
              maxLength={passwordMaxLength}
              placeholder="Tối thiểu 6 ký tự"
              className="input-mystic"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Xác nhận mật khẩu mới
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                if (error) setError("");
              }}
              maxLength={passwordMaxLength}
              placeholder="Nhập lại mật khẩu mới"
              className="input-mystic"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 w-full disabled:opacity-70"
          >
            {loading ? "Đang cập nhật..." : "Lưu mật khẩu mới"}
          </button>
        </form>
      )}
    </div>
  );
}
