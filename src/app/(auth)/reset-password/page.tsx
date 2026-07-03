"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import type { AuthError } from "@supabase/supabase-js";
import ButtonSpinner from "@/components/ui/ButtonSpinner";
import { createClient } from "@/lib/supabase/client";

const passwordMaxLength = 128;
const invalidRecoveryMessage =
  "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.";
const loginAfterRecoveryHref = "/login?fromRecovery=1";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [canReset, setCanReset] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const handleInvalidRecovery = async () => {
      await supabase.auth.signOut();

      if (!isMounted) return;

      setCanReset(false);
      setError(invalidRecoveryMessage);
      setCheckingSession(false);
    };

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
          await handleInvalidRecovery();
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
          await handleInvalidRecovery();
          return;
        }

        setCanReset(true);
        setCheckingSession(false);
        if (window.location.hash) {
          window.history.replaceState({}, "", "/reset-password");
        }
        return;
      }

      await handleInvalidRecovery();
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
      setError(getResetPasswordErrorMessage(updateError));
      return;
    }

    await supabase.auth.signOut();
    setLoading(false);
    setSuccess(
      "Đổi mật khẩu thành công. Hệ thống sẽ chuyển về trang đăng nhập.",
    );

    window.setTimeout(() => {
      router.push(loginAfterRecoveryHref);
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
          <p className="text-sm text-white">{error || invalidRecoveryMessage}</p>
          <Link
            href={loginAfterRecoveryHref}
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError("");
                }}
                maxLength={passwordMaxLength}
                placeholder="Tối thiểu 6 ký tự"
                className="input-mystic pr-12"
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

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Xác nhận mật khẩu mới
            </span>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  if (error) setError("");
                }}
                maxLength={passwordMaxLength}
                placeholder="Nhập lại mật khẩu mới"
                className="input-mystic pr-12"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((current) => !current)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
                aria-label={
                  showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 w-full disabled:opacity-70"
          >
            {loading && <ButtonSpinner />}
            Lưu mật khẩu mới
          </button>
        </form>
      )}
    </div>
  );
}

function getResetPasswordErrorMessage(error: AuthError) {
  const message = error.message.toLowerCase();

  if (
    message.includes("same password") ||
    message.includes("same as the old password") ||
    message.includes("different from the old password") ||
    message.includes("new password should be different")
  ) {
    return "Mật khẩu mới không được trùng với mật khẩu cũ.";
  }

  if (message.includes("password")) {
    return "Mật khẩu mới chưa hợp lệ. Vui lòng kiểm tra lại.";
  }

  return "Không thể cập nhật mật khẩu. Vui lòng thử lại.";
}
