"use client";

import { Check } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface Props {
  selected: boolean;
  count?: number;
  disabled?: boolean;
  /** vote: 투표/변경, pick: 동률 중재 선택 */
  mode?: "vote" | "pick";
  onClick: () => void;
}

/** 후보 투표/선택 토글 버튼(순수 프레젠테이션). */
export function VoteCandidateButton({ selected, count, disabled, mode = "vote", onClick }: Props) {
  const label =
    mode === "pick"
      ? selected
        ? "선택함"
        : "이 후보로 결정"
      : selected
        ? "투표함 · 변경하려면 다시 선택"
        : "이 후보에 투표";

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant={selected ? "secondary" : "default"}
      className="h-11 w-full rounded-xl text-sm font-semibold active:scale-[0.98]"
    >
      {selected && <Check className="h-4 w-4" />}
      {label}
      {typeof count === "number" && <span className="ml-1 opacity-70">({count})</span>}
    </Button>
  );
}
