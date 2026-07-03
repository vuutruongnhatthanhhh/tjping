import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mystic-dark px-4 py-10">
      <div className="glass-card w-full max-w-lg rounded-2xl p-6 text-center sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold text-white">
          Trang này không tồn tại
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Liên kết bạn vừa mở không hợp lệ hoặc đã bị xóa.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="btn-primary">
            Về trang chính
          </Link>
        </div>
      </div>
    </main>
  );
}
