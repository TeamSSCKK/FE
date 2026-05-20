"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MapPin, AlertTriangle } from "lucide-react";
import { fetchRoomStatus, type Room } from "@/entities/room";
import {
  fetchPlaceRecommendation,
  type PlaceRecommendationResult,
  type RecommendedPlace,
} from "@/entities/place-recommendation";
import { setMeetingLocation } from "@/entities/room/api/set-meeting-location";
import { NaverMap, type MapMarker } from "@/widgets/naver-map";
import { formatKoreanDateTime } from "@/shared/lib/format-datetime";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { PlaceResultCard } from "./PlaceResultCard";

interface Props {
  roomCode: string;
}

type Phase = "loading" | "error" | "success";

/** 핀을 중심으로 원이 퍼지는 로딩 그래픽 */
function SearchingGraphic() {
  return (
    <div className="animate-scale-in relative flex items-center justify-center">
      <span className="absolute h-24 w-24 animate-ping rounded-full bg-primary/20" />
      <span
        className="absolute h-24 w-24 animate-ping rounded-full bg-primary/20"
        style={{ animationDelay: "0.6s" }}
      />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30">
        <MapPin className="h-9 w-9 text-white" />
      </div>
    </div>
  );
}

export function PlaceRecommendationView({ roomCode }: Props) {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<PlaceRecommendationResult | null>(null);
  const [focusedPlaceId, setFocusedPlaceId] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // 언마운트 이후 비동기 응답이 setState를 건드리지 않도록 막는다.
  // strict mode 재마운트 대비로 setup에서 true를 다시 세팅한다.
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 헤더용 모임 정보 — 실패해도 화면 흐름은 막지 않는다.
  useEffect(() => {
    let canceled = false;
    fetchRoomStatus(roomCode)
      .then((status) => {
        if (!canceled) setRoom(status.room);
      })
      .catch((e) => console.error("fetchRoomStatus error", e));
    return () => {
      canceled = true;
    };
  }, [roomCode]);

  // 추천 요청 — 재시도 버튼에서도 재사용한다.
  const runRecommendation = useCallback(async () => {
    setPhase("loading");
    setErrorMessage(null);
    try {
      const res = await fetchPlaceRecommendation(roomCode);
      if (!isMounted.current) return;
      setResult(res);
      setFocusedPlaceId(res.places[0]?.id ?? null);
      setSelectedPlaceId(null);
      setPhase("success");
    } catch (e) {
      // 백엔드 raw 메시지 대신 사용자용 한국어 메시지로 통일
      console.error("fetchPlaceRecommendation error", e);
      if (!isMounted.current) return;
      setErrorMessage("추천 장소를 찾지 못했어요. 잠시 후 다시 시도해주세요.");
      setPhase("error");
    }
  }, [roomCode]);

  useEffect(() => {
    void runRecommendation();
  }, [runRecommendation]);

  // 장소 선택 → 즉시 모임 장소로 확정하고 큐레이션 안내 화면으로 이동.
  // 추천 결과엔 도로명 주소 데이터가 없어 category를 fallback으로 사용한다.
  const handleSelectPlace = useCallback(
    async (place: RecommendedPlace) => {
      setSelectedPlaceId(place.id);
      try {
        await setMeetingLocation({
          code: roomCode,
          location: {
            label: place.name,
            roadAddress: place.category ?? place.name,
            lat: place.lat,
            lng: place.lng,
          },
        });
        router.push(`/rooms/${roomCode}/curation`);
      } catch (e) {
        alert(e instanceof Error ? e.message : "장소 저장에 실패했어요.");
      }
    },
    [roomCode, router],
  );

  const focusedPlace = useMemo(
    () =>
      result?.places.find((p) => p.id === focusedPlaceId) ??
      result?.places[0] ??
      null,
    [result, focusedPlaceId],
  );

  // 캐러셀 — 가로 스크롤 위치로 중앙 카드를 판별한다.
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const scrollRaf = useRef<number | null>(null);

  // 스크롤 이벤트는 매우 잦으므로 rAF로 프레임당 1회만 측정 — 리플로우 batch
  const handleCarouselScroll = useCallback(() => {
    if (scrollRaf.current != null) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = null;
      const container = carouselRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const containerCenter = rect.left + rect.width / 2;
      let nearestId: string | null = null;
      let nearestDist = Infinity;
      cardRefs.current.forEach((el, id) => {
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.left + r.width / 2 - containerCenter);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestId = id;
        }
      });
      if (nearestId) setFocusedPlaceId(nearestId);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (scrollRaf.current != null) cancelAnimationFrame(scrollRaf.current);
    };
  }, []);

  // 지도 마커 클릭 → 해당 카드를 캐러셀 중앙으로 스크롤
  const scrollToPlace = useCallback((id: string) => {
    cardRefs.current.get(id)?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, []);

  // 마우스 드래그 스크롤 — 데스크톱에선 네이티브 가로 스크롤이 드래그를 지원하지 않는다.
  // (터치는 네이티브 스와이프가 더 자연스러우므로 mouse 포인터만 처리)
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const c = carouselRef.current;
    if (!c) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: c.scrollLeft,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const c = carouselRef.current;
    if (!drag.current.active || !c) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    c.scrollLeft = drag.current.startScroll - dx;
  };

  const endDrag = () => {
    const c = carouselRef.current;
    if (!drag.current.active || !c) return;
    drag.current.active = false;
    // 손을 떼면 가장 가까운 카드로 부드럽게 스냅
    const rect = c.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    let nearest: HTMLElement | null = null;
    let nearestDist = Infinity;
    for (const el of cardRefs.current.values()) {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - center);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = el;
      }
    }
    nearest?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  // 드래그로 끝난 포인터업이 카드 내부 버튼 클릭으로 새지 않도록 차단
  const handleClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.stopPropagation();
      e.preventDefault();
      drag.current.moved = false;
    }
  };

  // 지도 마커 — 멤버 출발지 + 추천 장소(focus된 곳 강조)
  const markers = useMemo<MapMarker[]>(() => {
    if (!result) return [];
    const memberMarkers: MapMarker[] = result.origins.map((o) => ({
      id: `origin-${o.memberId}`,
      lat: o.lat,
      lng: o.lng,
      variant: "member",
      label: o.memberName.charAt(0),
    }));
    const placeMarkers: MapMarker[] = result.places.map((p) => ({
      id: p.id,
      lat: p.lat,
      lng: p.lng,
      variant: p.id === focusedPlaceId ? "place-focused" : "place",
      label: p.name,
      onClick: () => scrollToPlace(p.id),
    }));
    return [...memberMarkers, ...placeMarkers];
  }, [result, focusedPlaceId, scrollToPlace]);

  return (
    <div className="flex h-dvh flex-col bg-white">
      {/* 헤더 */}
      <header className="flex items-center gap-2 border-b border-border/30 px-2 py-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition-all duration-150 hover:bg-primary/5 active:scale-95 active:bg-primary/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[12px] text-muted-foreground">
            {room ? `${room.name} · ${formatKoreanDateTime(room.dateTime)}` : ""}
          </p>
        </div>
        <div className="h-9 w-9" aria-hidden />
      </header>

      {phase === "success" && result && focusedPlace ? (
        <>
          {/* 제목 */}
          <div className="animate-fade-up px-5 pb-3 pt-5">
            <h1 className="text-[22px] font-bold tracking-tight text-gray-900">
              추천 장소를 확인해보세요
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              좌우로 넘겨 후보를 비교하고 장소를 선택하세요.
            </p>
          </div>

          {/* 지도 */}
          <div className="mx-5 h-[44vh] flex-shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
            <NaverMap
              center={{ lat: focusedPlace.lat, lng: focusedPlace.lng }}
              markers={markers}
              showCenterPin={false}
            />
          </div>

          {/* 페이지 인디케이터 */}
          <div className="flex justify-center gap-1.5 pt-3">
            {result.places.map((p) => (
              <span
                key={p.id}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  p.id === focusedPlace.id
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-primary/20",
                )}
              />
            ))}
          </div>

          {/* 추천 장소 캐러셀 — 가로 스냅 스크롤 */}
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onClickCapture={handleClickCapture}
            className="flex flex-1 cursor-grab snap-x snap-mandatory select-none gap-3 overflow-x-auto px-[10%] py-3 active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {result.places.map((p, i) => (
              <div
                key={p.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(p.id, el);
                  else cardRefs.current.delete(p.id);
                }}
                className="flex w-[80%] flex-shrink-0 snap-center"
              >
                <PlaceResultCard
                  place={p}
                  rank={i + 1}
                  focused={p.id === focusedPlace.id}
                  selected={p.id === selectedPlaceId}
                  onSelect={() => handleSelectPlace(p)}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* 제목 블록 */}
          <div className="animate-fade-up px-5 pt-8">
            <h1 className="text-[28px] font-bold tracking-tight text-gray-900">
              모임 장소 추천
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              모두에게 공정한 장소를 추천해드려요.
            </p>
          </div>

          {/* 중앙 영역 — 로딩 / 에러 */}
          <div className="flex flex-1 items-center justify-center px-5">
            {phase === "loading" && <SearchingGraphic />}

            {phase === "error" && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    추천을 완료하지 못했어요
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {errorMessage}
                  </p>
                </div>
                <Button
                  onClick={runRecommendation}
                  className="h-12 rounded-2xl px-8 text-sm font-semibold active:scale-[0.97]"
                >
                  다시 시도
                </Button>
              </div>
            )}
          </div>

          {/* 하단 안내 — 로딩 중에만 */}
          {phase === "loading" && (
            <p className="animate-fade-up px-5 pb-10 text-center text-[13px] text-muted-foreground">
              최적의 장소를 찾기 위해 열심히 검색하고 있어요.
            </p>
          )}
        </>
      )}
    </div>
  );
}
