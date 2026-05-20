"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { fetchRoomStatus } from "@/entities/room";
import { fetchRestaurantRecommendation } from "@/entities/restaurant-recommendation/api/fetch-restaurant-recommendation";
import type { RecommendedRestaurant } from "@/entities/restaurant-recommendation/model/types";
import { loadMemberId } from "@/shared/lib/room-session";
import { cn } from "@/shared/lib/utils";

interface Props {
  code: string;
}

type Phase = "loading" | "success" | "error";

export function RestaurantRecommendationView({ code }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [restaurants, setRestaurants] = useState<RecommendedRestaurant[]>([]);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 호스트만 접근 가능 — 멤버/게스트는 모임 현황으로 돌려보낸다.
  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        const memberId = loadMemberId(code);
        if (!memberId) {
          if (!canceled) router.replace(`/rooms/${code}`);
          return;
        }
        const status = await fetchRoomStatus(code);
        if (canceled) return;
        const me = status.members.find((m) => m.id === memberId);
        if (!me?.isHost) {
          router.replace(`/rooms/${code}`);
          return;
        }
        // 추천 시뮬레이션 — 실제 API 연동 전 mock 지연
        await new Promise((r) => setTimeout(r, 1200));
        if (!isMounted.current || canceled) return;
        const result = await fetchRestaurantRecommendation(code);
        if (canceled) return;
        if (result.restaurants.length === 0) {
          setErrorMessage("추천할 수 있는 식당이 없어요.");
          setPhase("error");
          return;
        }
        setRestaurants(result.restaurants);
        setPhase("success");
      } catch (e) {
        console.error("restaurant recommendation guard error", e);
        if (canceled) return;
        setErrorMessage("식당 추천 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
        setPhase("error");
      }
    })();

    return () => {
      canceled = true;
    };
  }, [code, router]);

  const totalCount = restaurants.length;
  const current = useMemo(
    () => restaurants[activeIndex],
    [restaurants, activeIndex],
  );

  const handlePrev = () => {
    setActiveIndex((i) => (i - 1 + totalCount) % totalCount);
  };

  const handleNext = () => {
    setActiveIndex((i) => (i + 1) % totalCount);
  };

  const handleSelect = () => {
    alert(`"${current.name}"(을)를 모임 식당으로 선택했어요.`);
    router.push(`/rooms/${code}`);
  };

  if (phase === "loading") {
    return (
      <div className="flex min-h-dvh flex-col bg-white px-5 pt-10">
        <h1 className="text-[28px] font-bold tracking-tight text-gray-900">
          모임 식당 추천
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          모두의 취향을 모아 식당을 골라드릴게요.
        </p>

        <div className="mt-8 rounded-2xl bg-purple-600 p-6 text-white shadow-lg shadow-purple-600/20">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
              <MapPin className="h-5 w-5 text-white" />
            </span>
            <p className="text-base font-semibold leading-snug">
              참가자 모두의 취향과 출발지를 종합해
              <br />
              최적의 식당을 찾고 있어요.
            </p>
          </div>
        </div>

        <p className="mt-auto pb-12 text-center text-[13px] text-muted-foreground">
          잠시만 기다려주세요 · 추천이 곧 완료돼요.
        </p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-5">
        <p className="text-base font-semibold text-gray-900">
          식당 추천을 완료하지 못했어요
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
        <button
          type="button"
          onClick={() => router.push(`/rooms/${code}`)}
          className="mt-6 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700"
        >
          모임 현황으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="flex items-center gap-2 border-b border-border/30 px-2 py-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition-all hover:bg-primary/5 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1" />
        <div className="h-9 w-9" aria-hidden />
      </header>

      <div className="px-5 pt-5">
        <h1 className="text-[22px] font-bold tracking-tight text-gray-900">
          추천 식당을 확인해보세요
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {activeIndex + 1} / {totalCount} · 좌우 화살표로 후보를 비교하세요.
        </p>
      </div>

      <div className="mx-5 mt-4 flex h-[40vh] flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <MapPin className="h-8 w-8" />
          <p className="text-xs">지도 영역</p>
          <p className="text-[11px]">도보 {current.travelTimeMinutes}분</p>
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {restaurants.map((r, i) => (
          <span
            key={r.id}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === activeIndex ? "w-4 bg-purple-600" : "w-1.5 bg-purple-200",
            )}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 px-5">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="이전 식당"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-[11px] text-purple-600">
            {current.tags?.join(" · ") || "추천"}
          </p>
          <p className="mt-1 text-base font-bold text-gray-900">
            {current.name}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            대표 메뉴 · {current.representativeMenu?.join(", ") || "-"}
          </p>
          <p className="mt-2 text-[12px] text-gray-700">
            ★ 적합도 {current.fitScore}%{" "}
            <span className="text-muted-foreground">
              (도보 {current.travelTimeMinutes}분)
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleNext}
          aria-label="다음 식당"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-auto px-5 pb-6 pt-6">
        <button
          type="button"
          onClick={handleSelect}
          className="w-full rounded-full bg-purple-600 py-4 text-sm font-semibold text-white hover:bg-purple-700 active:scale-[0.98]"
        >
          이 식당 선택하기
        </button>
      </div>
    </div>
  );
}
