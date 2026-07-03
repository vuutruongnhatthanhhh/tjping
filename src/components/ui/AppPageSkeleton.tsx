import Logo from "@/components/brand/Logo";

function SkeletonBlock({
  className,
}: {
  className: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-sky-200/10 ${className}`}
      aria-hidden="true"
    />
  );
}

function DesktopSidebarSkeleton() {
  return (
    <aside
      className="sticky top-0 hidden h-screen w-16 flex-shrink-0 border-r bg-[rgba(7,18,34,0.95)] backdrop-blur-[20px] lg:flex"
      style={{ borderColor: "rgba(96,165,250,0.14)" }}
    >
      <div className="flex w-full flex-col">
        <div
          className="flex items-center border-b px-3 py-5"
          style={{ borderColor: "rgba(96,165,250,0.15)" }}
        >
          <Logo compact />
        </div>
        <div className="space-y-3 px-2 py-4">
          <SkeletonBlock className="h-11 w-full rounded-xl" />
          <SkeletonBlock className="h-11 w-full rounded-xl" />
          <SkeletonBlock className="h-11 w-full rounded-xl" />
        </div>
        <div
          className="mt-auto space-y-3 border-t px-2 py-4"
          style={{ borderColor: "rgba(96,165,250,0.15)" }}
        >
          <SkeletonBlock className="h-14 w-full rounded-xl" />
          <SkeletonBlock className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </aside>
  );
}

function MobileHeaderSkeleton() {
  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-4 px-4 py-4 sm:px-6 lg:hidden"
      style={{
        background: "rgba(6, 17, 31, 0.84)",
        borderBottom: "1px solid rgba(96,165,250,0.12)",
        backdropFilter: "blur(20px)",
      }}
    >
      <SkeletonBlock className="h-10 w-10 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonBlock className="h-5 w-32 rounded-lg" />
        <SkeletonBlock className="h-3 w-56 max-w-full rounded-lg" />
      </div>
      <SkeletonBlock className="h-10 w-10 rounded-xl sm:hidden" />
      <SkeletonBlock className="hidden h-10 w-32 rounded-xl sm:block" />
    </header>
  );
}

function DesktopHeaderSkeleton({
  titleWidth = "w-40",
  subtitleWidth = "w-72",
}: {
  titleWidth?: string;
  subtitleWidth?: string;
}) {
  return (
    <header
      className="sticky top-0 z-30 hidden items-center gap-4 px-4 py-4 sm:px-6 lg:flex"
      style={{
        background: "rgba(6, 17, 31, 0.84)",
        borderBottom: "1px solid rgba(96,165,250,0.12)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonBlock className={`h-6 ${titleWidth} rounded-lg`} />
        <SkeletonBlock className={`h-3 ${subtitleWidth} max-w-full rounded-lg`} />
      </div>
      <SkeletonBlock className="h-10 w-36 rounded-xl" />
      <SkeletonBlock className="h-10 w-10 rounded-xl" />
    </header>
  );
}

function StatCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <SkeletonBlock className="h-3 w-24 rounded-lg" />
          <SkeletonBlock className="h-9 w-16 rounded-lg" />
          <SkeletonBlock className="h-3 w-28 rounded-lg" />
        </div>
        <SkeletonBlock className="h-12 w-12 rounded-2xl" />
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <AppShellSkeleton
      titleWidth="w-44"
      subtitleWidth="w-80"
      hero
      statCount={4}
      sections={
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="glass-card rounded-2xl p-5 xl:col-span-3">
              <div className="space-y-4">
                <SkeletonBlock className="h-5 w-40 rounded-lg" />
                <SkeletonBlock className="h-4 w-full rounded-lg" />
                <SkeletonBlock className="h-4 w-5/6 rounded-lg" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <SkeletonBlock className="h-12 w-full rounded-xl" />
                  <SkeletonBlock className="h-12 w-full rounded-xl" />
                  <SkeletonBlock className="h-24 w-full rounded-xl sm:col-span-2" />
                </div>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5 xl:col-span-2">
              <div className="space-y-4">
                <SkeletonBlock className="h-5 w-36 rounded-lg" />
                <SkeletonBlock className="h-20 w-full rounded-xl" />
                <SkeletonBlock className="h-20 w-full rounded-xl" />
                <SkeletonBlock className="h-20 w-full rounded-xl" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="glass-card rounded-2xl p-5 xl:col-span-3">
              <div className="space-y-4">
                <SkeletonBlock className="h-5 w-32 rounded-lg" />
                <SkeletonBlock className="h-16 w-full rounded-xl" />
                <SkeletonBlock className="h-16 w-full rounded-xl" />
                <SkeletonBlock className="h-16 w-full rounded-xl" />
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5 xl:col-span-2">
              <div className="space-y-4">
                <SkeletonBlock className="h-5 w-24 rounded-lg" />
                <SkeletonBlock className="h-14 w-full rounded-xl" />
                <SkeletonBlock className="h-14 w-full rounded-xl" />
                <SkeletonBlock className="h-14 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </>
      }
    />
  );
}

export function RemindersPageSkeleton() {
  return (
    <AppShellSkeleton
      titleWidth="w-28"
      subtitleWidth="w-72"
      statCount={3}
      sections={
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <SkeletonBlock className="h-5 w-32 rounded-lg" />
                <SkeletonBlock className="h-4 w-72 max-w-full rounded-lg" />
              </div>
              <SkeletonBlock className="h-10 w-36 rounded-xl" />
            </div>

            <div className="hidden xl:block">
              <div className="grid grid-cols-[1.5fr_1.2fr_0.8fr_1fr_1fr_1.1fr_1fr] gap-3 pb-4">
                {Array.from({ length: 7 }).map((_, index) => (
                  <SkeletonBlock key={index} className="h-4 w-full rounded-lg" />
                ))}
              </div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="grid grid-cols-[1.5fr_1.2fr_0.8fr_1fr_1fr_1.1fr_1fr] gap-3 rounded-2xl bg-white/[0.02] p-4"
                  >
                    {Array.from({ length: 7 }).map((_, columnIndex) => (
                      <SkeletonBlock
                        key={`${rowIndex}-${columnIndex}`}
                        className="h-12 w-full rounded-xl"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 xl:hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-sky-400/10 bg-white/[0.02] p-4"
                >
                  <div className="space-y-3">
                    <SkeletonBlock className="h-6 w-40 rounded-lg" />
                    <SkeletonBlock className="h-16 w-full rounded-xl" />
                    <div className="grid grid-cols-2 gap-3">
                      <SkeletonBlock className="h-10 w-full rounded-xl" />
                      <SkeletonBlock className="h-10 w-full rounded-xl" />
                    </div>
                    <SkeletonBlock className="h-10 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="space-y-4">
              <SkeletonBlock className="h-5 w-36 rounded-lg" />
              <SkeletonBlock className="h-40 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      }
    />
  );
}

export function ChannelsPageSkeleton() {
  return (
    <AppShellSkeleton
      titleWidth="w-28"
      subtitleWidth="w-80"
      statCount={3}
      sections={
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5">
              <div className="space-y-4">
                <SkeletonBlock className="h-5 w-32 rounded-lg" />
                <SkeletonBlock className="h-20 w-full rounded-2xl" />
                <SkeletonBlock className="h-12 w-full rounded-xl" />
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <div className="space-y-4">
                <SkeletonBlock className="h-5 w-40 rounded-lg" />
                <SkeletonBlock className="h-24 w-full rounded-2xl" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <SkeletonBlock className="h-12 w-full rounded-xl" />
                  <SkeletonBlock className="h-12 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="space-y-4">
              <SkeletonBlock className="h-5 w-28 rounded-lg" />
              <SkeletonBlock className="h-24 w-full rounded-2xl" />
              <SkeletonBlock className="h-24 w-full rounded-2xl" />
              <SkeletonBlock className="h-24 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      }
    />
  );
}

function AppShellSkeleton({
  titleWidth,
  subtitleWidth,
  statCount,
  sections,
  hero = false,
}: {
  titleWidth: string;
  subtitleWidth: string;
  statCount: number;
  sections: React.ReactNode;
  hero?: boolean;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-mystic-dark">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute right-[8%] top-[-16%] h-[520px] w-[520px] rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #2563EB, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-18%] left-[8%] h-[420px] w-[420px] rounded-full opacity-14 blur-3xl"
          style={{
            background: "radial-gradient(circle, #06B6D4, transparent 70%)",
          }}
        />
      </div>

      <DesktopSidebarSkeleton />

      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <MobileHeaderSkeleton />
        <DesktopHeaderSkeleton
          titleWidth={titleWidth}
          subtitleWidth={subtitleWidth}
        />

        <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {hero && (
            <section className="mb-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                  <SkeletonBlock className="h-4 w-36 rounded-lg" />
                  <SkeletonBlock className="h-10 w-[32rem] max-w-full rounded-xl" />
                  <SkeletonBlock className="h-4 w-[34rem] max-w-full rounded-lg" />
                  <SkeletonBlock className="h-4 w-[28rem] max-w-full rounded-lg" />
                </div>
                <SkeletonBlock className="h-11 w-full rounded-xl sm:w-44" />
              </div>
            </section>
          )}

          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: statCount }).map((_, index) => (
              <StatCardSkeleton key={index} />
            ))}
          </section>

          {sections}
        </div>
      </main>
    </div>
  );
}

export function AuthPageSkeleton() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mystic-dark px-4 py-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-[12%] top-[-16%] h-[480px] w-[480px] rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[8%] h-[380px] w-[380px] rounded-full bg-blue-600/16 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <SkeletonBlock className="h-8 w-40 rounded-xl" />
              <SkeletonBlock className="h-4 w-64 max-w-full rounded-lg" />
            </div>
            <SkeletonBlock className="h-12 w-full rounded-xl" />
            <SkeletonBlock className="h-12 w-full rounded-xl" />
            <SkeletonBlock className="h-12 w-full rounded-xl" />
            <SkeletonBlock className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
