"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

type Status = "loading" | "success" | "error";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Link xác nhận không hợp lệ.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setTimeout(() => router.push("/login"), 2500);
          return;
        }

        setStatus("error");
        setError(data.error || "Không thể xác nhận email.");
      })
      .catch(() => {
        setStatus("error");
        setError("Có lỗi xảy ra. Vui lòng thử lại.");
      });
  }, [router, token]);

  return (
    <div className="glass-card rounded-2xl p-8 text-center">
      {status === "loading" && (
        <>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-sky-300" />
          <h1 className="mt-5 text-2xl font-bold text-white">Đang xác nhận</h1>
          <p className="mt-2 text-sm text-slate-400">Vui lòng chờ trong giây lát.</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-300" />
          <h1 className="mt-5 text-2xl font-bold text-white">Xác nhận thành công</h1>
          <p className="mt-2 text-sm text-slate-400">
            Tài khoản đã được kích hoạt. Đang chuyển đến trang đăng nhập.
          </p>
          <Link href="/login" className="btn-primary mt-5 inline-flex">
            Đăng nhập
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="mx-auto h-10 w-10 text-red-300" />
          <h1 className="mt-5 text-2xl font-bold text-white">Xác nhận thất bại</h1>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <Link href="/register" className="btn-primary mt-5 inline-flex">
            Đăng ký lại
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="glass-card rounded-2xl p-8 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-sky-300" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
