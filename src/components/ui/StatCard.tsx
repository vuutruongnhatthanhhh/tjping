import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  tone?: "blue" | "cyan" | "green" | "red";
  className?: string;
}

const toneMap = {
  blue: {
    icon: "rgba(37,99,235,0.16)",
    color: "#60A5FA",
    glow: "rgba(37,99,235,0.2)",
  },
  cyan: {
    icon: "rgba(6,182,212,0.16)",
    color: "#22D3EE",
    glow: "rgba(6,182,212,0.16)",
  },
  green: {
    icon: "rgba(34,197,94,0.15)",
    color: "#4ADE80",
    glow: "rgba(34,197,94,0.13)",
  },
  red: {
    icon: "rgba(239,68,68,0.15)",
    color: "#F87171",
    glow: "rgba(239,68,68,0.12)",
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone = "blue",
  className,
}: StatCardProps) {
  const colors = toneMap[tone];

  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="mb-1 truncate text-sm font-medium text-slate-400">
            {title}
          </p>
          <p className="truncate text-2xl font-bold leading-tight text-white">
            {value}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">{subtitle}</p>
        </div>
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
          style={{
            background: colors.icon,
            color: colors.color,
            boxShadow: `0 0 20px ${colors.glow}`,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
