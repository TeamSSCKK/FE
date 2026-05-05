"use client";

import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface Props {
  onClick: () => void;
  className?: string;
}

export function ClearButton({ onClick, className }: Props) {
  return (
    <button
      type="button"
      aria-label="입력 지우기"
      onClick={onClick}
      className={cn(
        "absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-foreground/10 text-foreground/60 transition-all duration-150 hover:bg-foreground/15 hover:text-foreground active:scale-90",
        className,
      )}
    >
      <X className="h-3.5 w-3.5" strokeWidth={2.75} />
    </button>
  );
}
