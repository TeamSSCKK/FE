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
        "absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <X className="h-4 w-4" strokeWidth={2.5} />
    </button>
  );
}
