"use client";

import { Crosshair, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface Props {
  onClick: () => void;
  isLocating?: boolean;
  className?: string;
}

/**
 * 지도 위에 떠 있는 원형 버튼. 누르면 사용자의 현재 위치로 지도를 이동시킨다.
 * 위치 요청 로직은 view 레이어에서 onClick으로 주입한다 (FSD: features → widgets 금지).
 */
export function CurrentLocationButton({ onClick, isLocating, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLocating}
      aria-label="현재 위치로 이동"
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-gray-700 shadow-md transition active:scale-90 disabled:opacity-60",
        className,
      )}
    >
      {isLocating ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      ) : (
        <Crosshair className="h-5 w-5" aria-hidden />
      )}
    </button>
  );
}
