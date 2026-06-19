"use client";

import { Check, Clock, Crown } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import type { RecommendedPlace } from "@/entities/place-recommendation";

interface Props {
  place: RecommendedPlace;
  /** 추천 순위 (1부터) */
  rank: number;
  /** 캐러셀 중앙에 위치한 카드인지 — 주변 카드는 흐리게 */
  focused: boolean;
  /** 내가 투표한 후보인지 */
  isMyVote: boolean;
  /** 현재 득표수 */
  count?: number;
  /** 투표 비활성(제출 중·확정됨 등) */
  disabled?: boolean;
  onVote: () => void;
}

export function PlaceResultCard({
  place,
  rank,
  focused,
  isMyVote,
  count,
  disabled,
  onVote,
}: Props) {
  return (
    <div
      className={cn(
        "flex w-full flex-col rounded-2xl border bg-white p-4 transition-all duration-300 ease-out",
        focused ? "scale-100 opacity-100 shadow-md" : "scale-[0.93] opacity-45",
        isMyVote ? "border-primary" : "border-border/50",
      )}
    >
      {/* 장소명 + 분류 + 득표 */}
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
            rank === 1 ? "bg-primary text-white" : "bg-primary/10 text-primary",
          )}
        >
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[16px] font-bold text-gray-900">{place.name}</p>
            {isMyVote && (
              <span className="inline-flex flex-shrink-0 items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                <Check className="h-3 w-3" />
                내 투표
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[12px] text-muted-foreground">{place.category}</p>
        </div>
        {typeof count === "number" && count > 0 && (
          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[12px] font-semibold text-primary">
            <Crown className="h-3 w-3" />
            {count}표
          </span>
        )}
      </div>

      {/* 평균 이동 시간 */}
      <div className="mt-3 rounded-xl bg-primary/[0.05] px-3 py-2 text-center">
        <span className="text-[13px] text-gray-700">평균 이동 시간 </span>
        <span className="text-[15px] font-bold text-primary">{place.averageMinutes}분</span>
      </div>

      {/* 참가자별 이동 시간 */}
      <p className="mb-1.5 mt-3 text-[12px] font-medium text-muted-foreground">
        참가자별 예상 이동 시간
      </p>
      <ul className="max-h-36 space-y-1.5 overflow-y-auto">
        {place.memberTravels.map((t) => (
          <li key={t.memberId} className="flex items-center justify-between text-[13px]">
            <span className="text-gray-700">{t.memberName}</span>
            <span className="inline-flex items-center gap-1 font-medium text-gray-900">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {t.minutes}분
            </span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onVote}
        disabled={disabled}
        variant={isMyVote ? "secondary" : "default"}
        className="mt-4 h-11 w-full rounded-xl text-sm font-semibold active:scale-[0.98]"
      >
        {isMyVote ? "투표함 · 변경하려면 다른 후보 선택" : "이 장소에 투표"}
      </Button>
    </div>
  );
}
