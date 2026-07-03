"use client";

import { cn } from "@/lib/utils";

interface ButtonSpinnerProps {
  className?: string;
}

export default function ButtonSpinner({
  className,
}: ButtonSpinnerProps) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white",
        className,
      )}
      aria-hidden="true"
    />
  );
}
