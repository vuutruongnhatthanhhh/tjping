import Logo from "@/components/brand/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mystic-dark px-4 py-10">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute right-[12%] top-[-16%] h-[480px] w-[480px] rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[8%] h-[380px] w-[380px] rounded-full bg-blue-600/16 blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        {children}
      </div>
    </main>
  );
}
