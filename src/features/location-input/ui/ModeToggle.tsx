"use client";

import { cn } from "@/shared/lib/utils";
import { useLocationInputStore } from "../model/store";
import type { LocationInputMode } from "../model/types";

const OPTIONS: { value: LocationInputMode; label: string }[] = [
  { value: "map", label: "지도에서 선택" },
  { value: "search", label: "주소로 검색" },
];

export function ModeToggle() {
  const mode = useLocationInputStore((s) => s.mode);
  const setMode = useLocationInputStore((s) => s.setMode);

  return (
    <div className="flex w-full rounded-full bg-neutral-100 p-1">
      {OPTIONS.map((opt) => {
        const active = mode === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setMode(opt.value)}
            className={cn(
              "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all",
              active
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
