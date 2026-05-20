"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
} from "lucide-react";
import { fetchRestaurantRecommendation } from "@/entities/restaurant-recommendation";
import type { RecommendedRestaurant } from "@/entities/restaurant-recommendation";
import { fetchRoomStatus } from "@/entities/room";
import type { Room } from "@/entities/room";
import { loadMemberId } from "@/shared/lib/room-session";
import { formatKoreanDateTime } from "@/shared/lib/format-datetime";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const EMOJIS = ["🍜", "🍕", "🍣", "🍔", "🥗"];
const STEPS = [
  "참여자 위치 분석 중...",
  "취향 데이터 매칭 중...",
  "주변 식당 검색 중...",
  "최적의 식당 선별 중...",
];

interface Props {
  code: string;
}

type Phase = "loading" | "success" | "error";

export function RestaurantRecommendationView({ code }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [room, setRoom] = useState<Room | null>(null);
  const [restaurants, setRestaurants] = useState<RecommendedRestaurant[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [apiDone, setApiDone] = useState(false);

  // 호스트 가드 + 추천 호출
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await fetchRoomStatus(code);
        if (cancelled) return;
        const memberId = loadMemberId(code);
        const me = memberId
          ? status.members.find((m) => m.id === memberId)
          : undefined;
        const isHostBySession = !!me?.isHost;
        // 같은 브라우저에서 방을 만든 호스트는 sessionStorage에 memberId가
        // 없을 수 있으므로, room-${code} 키 존재 여부로 폴백 판정한다.
        const isHostByFallback =
          !memberId &&
          typeof window !== "undefined" &&
          !!localStorage.getItem(`room-${code}`);
        if (!isHostBySession && !isHostByFallback) {
          router.replace(`/rooms/${code}`);
          return;
        }
        setRoom(status.room);
        const result = await fetchRestaurantRecommendation(code);
        if (cancelled) return;
        setRestaurants(result.restaurants);
        setApiDone(true);
      } catch (e) {
        if (cancelled) return;
        setErrorMessage(
          e instanceof Error ? e.message : "추천 식당을 불러오지 못했어요.",
        );
        setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, router]);

  // 로딩 단계 진행 — 1.5초마다 다음 단계로
  useEffect(() => {
    if (phase !== "loading") return;
    if (loadingStep >= STEPS.length) return;
    const t = setTimeout(() => setLoadingStep((s) => s + 1), 1500);
    return () => clearTimeout(t);
  }, [phase, loadingStep]);

  // API 완료 + 모든 step 완료 → success
  useEffect(() => {
    if (phase === "loading" && apiDone && loadingStep >= STEPS.length) {
      setPhase("success");
    }
  }, [phase, apiDone, loadingStep]);

  // 이모지 순환
  useEffect(() => {
    if (phase !== "loading") return;
    const i = setInterval(
      () => setEmojiIndex((p) => (p + 1) % EMOJIS.length),
      1500,
    );
    return () => clearInterval(i);
  }, [phase]);

  const handleSelect = () => {
    const r = restaurants[currentIndex];
    if (!r) return;
    alert(`${r.name} 선택 완료!`);
    router.push(`/rooms/${code}`);
  };

  // ===== 렌더링 =====

  if (phase === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-center text-red-500">{errorMessage}</p>
        <Button onClick={() => window.location.reload()}>다시 시도</Button>
      </div>
    );
  }

  if (phase === "loading") {
    const progress = Math.min(loadingStep, STEPS.length) * 25;
    return (
      <div className="min-h-screen bg-gray-100 px-5 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="text-2xl"
        >
          ‹
        </button>
        <p className="-mt-6 text-center text-xs text-gray-400">
          {room ? `${room.name} · ${formatKoreanDateTime(room.dateTime)}` : ""}
        </p>

        <div className="mt-12 flex flex-col items-center">
          <h1 className="text-3xl font-bold">모임 식당 추천</h1>
          <div className="mt-4 rounded-lg border-2 border-purple-500 px-4 py-2 text-center text-sm">
            <p className="whitespace-pre-line">
              여러분이 고른 위치에서{"\n"}
              모두가 좋아하는 식당을 찾아드려요.
            </p>
          </div>

          <div className="mt-12 flex h-24 items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={emojiIndex}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
                className="text-7xl"
              >
                {EMOJIS[emojiIndex]}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 w-full max-w-xs space-y-3">
            {STEPS.map((label, i) => {
              const isActive = i === loadingStep;
              const isDone = i < loadingStep;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    isActive && "font-semibold text-purple-600",
                    isDone && "text-gray-400",
                    !isActive && !isDone && "text-gray-300",
                  )}
                >
                  {isDone && <Check size={16} className="text-green-500" />}
                  {isActive && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {!isActive && !isDone && <span className="w-4" />}
                  <span>{label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-8 text-xs text-gray-500">
            최적의 식당을 찾기 위해 열심히 검색하고 있어요.
          </p>
        </div>
      </div>
    );
  }

  // phase === "success"
  const restaurant = restaurants[currentIndex];
  if (!restaurant) {
    return <div className="p-8 text-gray-500">추천 결과가 없어요.</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="px-5 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="text-2xl"
        >
          ‹
        </button>
        <p className="-mt-6 text-center text-xs text-gray-400">
          {room ? `${room.name} · ${formatKoreanDateTime(room.dateTime)}` : ""}
        </p>

        <h1 className="mt-6 text-2xl font-bold">
          모두가 만족하는 식당은 여기예요.
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          어떤 장소가 가장 마음에 드시나요?
        </p>

        <div className="relative mt-6 flex h-48 items-center justify-center rounded-2xl bg-gray-200">
          <MapPin className="absolute left-1/3 top-8 text-gray-500" size={28} />
          <MapPin
            className="absolute left-1/2 top-1/2 text-gray-600"
            size={28}
          />
          <MapPin
            className="absolute bottom-8 right-1/3 text-gray-500"
            size={28}
          />
          <span className="absolute bottom-2 text-xs text-gray-400">
            지도 영역 (추후 네이버 지도 API 연동)
          </span>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {restaurants.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-2 rounded-full",
                i === currentIndex ? "bg-purple-600" : "bg-gray-300",
              )}
            />
          ))}
        </div>

        <div className="relative mt-4">
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 disabled:opacity-30"
            aria-label="이전 식당"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrentIndex((i) =>
                Math.min(restaurants.length - 1, i + 1),
              )
            }
            disabled={currentIndex === restaurants.length - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 disabled:opacity-30"
            aria-label="다음 식당"
          >
            <ChevronRight size={28} />
          </button>

          <div className="px-10">
            <p className="text-xs text-gray-500">
              추천 식당 {currentIndex + 1}
            </p>
            <h2 className="text-2xl font-bold">{restaurant.name}</h2>
            <p className="mt-1 text-sm text-gray-500">
              역에서 이동 {restaurant.travelTimeMinutes}분 - 적합도{" "}
              {restaurant.fitScore}%
            </p>
            <div className="mt-2 flex gap-4">
              <button
                type="button"
                onClick={() => window.open(restaurant.naverMapUrl, "_blank")}
                className="text-sm text-purple-600 underline"
              >
                네이버 지도 바로가기
              </button>
              <button
                type="button"
                onClick={() => window.open(restaurant.kakaoMapUrl, "_blank")}
                className="text-sm text-purple-600 underline"
              >
                카카오 지도 바로가기
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {restaurant.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs"
                >
                  # {t}
                </span>
              ))}
            </div>

            <p className="mt-3 text-sm">
              대표 메뉴 : {restaurant.representativeMenu.join(", ")}
            </p>

            <div className="mt-3 flex gap-2 overflow-x-auto">
              {restaurant.photos.map((p) =>
                p.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p.id}
                    src={p.url}
                    alt=""
                    className="h-24 w-24 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    key={p.id}
                    className="h-24 w-24 shrink-0 rounded-lg bg-gray-200"
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-md border-t bg-white px-5 py-4">
        <Button
          className="w-full bg-purple-600 text-white hover:bg-purple-700"
          size="lg"
          onClick={handleSelect}
        >
          이 식당 선택하기
        </Button>
      </div>
    </div>
  );
}
