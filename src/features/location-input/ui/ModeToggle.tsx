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
    <div className="relative flex w-full overflow-hidden rounded-full bg-neutral-100 p-1">
      {/* 슬라이딩 인디케이터 — 선택된 탭으로 흰 배경이 부드럽게 미끄러진다 */}
      <div
        className={cn(
          "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          mode === "search" && "translate-x-full",
        )}
        aria-hidden
      />
      {OPTIONS.map((opt) => {
        const active = mode === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setMode(opt.value)}
            className={cn(
              "relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
