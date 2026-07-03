import { BellRing, Radio } from "lucide-react";

interface LogoProps {
  compact?: boolean;
}

export default function Logo({ compact = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{
          background: "linear-gradient(135deg, #2563EB, #0284C7)",
          boxShadow: "0 0 18px rgba(37,99,235,0.45)",
        }}
      >
        <BellRing className="h-5 w-5 text-white" />
        <Radio className="absolute -right-1 -top-1 h-4 w-4 text-sky-200" />
      </div>
      {!compact && (
        <div className="leading-none">
          <span className="text-lg font-bold text-white">TJ</span>
          <span className="text-lg font-bold text-sky-400">Ping</span>
        </div>
      )}
    </div>
  );
}
