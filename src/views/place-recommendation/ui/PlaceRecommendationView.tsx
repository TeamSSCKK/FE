"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MapPin, AlertTriangle } from "lucide-react";
import { useRoomRole } from "@/entities/room";
import { setMeetingLocation } from "@/entities/room/api/set-meeting-location";
import {
  fetchPlaceRecommendation,
  type PlaceRecommendationResult,
  type RecommendedPlace,
} from "@/entities/place-recommendation";
import { fetchVoteResults, type VoteResults } from "@/entities/vote";
import { useVoteActionStore } from "@/features/vote-action";
import { VoteResultsPanel } from "@/widgets/vote-results";
import { NaverMap, type MapMarker } from "@/widgets/naver-map";
import { formatKoreanDateTime } from "@/shared/lib/format-datetime";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { PlaceResultCard } from "./PlaceResultCard";
import { FallbackNotice } from "./FallbackNotice";

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
  const role = useRoomRole(roomCode);
  const room = role.roomStatus?.room ?? null;
  const meetingId = role.roomStatus?.room.meetingId ?? null;

  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<PlaceRecommendationResult | null>(null);
  const [focusedPlaceId, setFocusedPlaceId] = useState<string | null>(null);

  // 투표 스토어 (PLACE)
  const initVote = useVoteActionStore((s) => s.init);
  const selectVote = useVoteActionStore((s) => s.select);
  const submitVote = useVoteActionStore((s) => s.submit);
  const submittedCandidateId = useVoteActionStore((s) => s.submittedCandidateId);
  const isSubmitting = useVoteActionStore((s) => s.isSubmitting);

  // 투표 현황 (폴링)
  const [voteResults, setVoteResults] = useState<VoteResults | null>(null);
  const finalizedRef = useRef(false);

  // 언마운트 이후 비동기 응답이 setState를 건드리지 않도록 막는다.
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    initVote("PLACE");
  }, [initVote]);

  // 추천 요청 — 재시도 버튼에서도 재사용한다.
  // (이미 PLACE_VOTING이면 백엔드가 409 → fetchPlaceRecommendation이 캐시 후보로 폴백한다.)
  const runRecommendation = useCallback(async () => {
    setPhase("loading");
    setErrorMessage(null);
    try {
      const res = await fetchPlaceRecommendation(roomCode);
      if (!isMounted.current) return;
      setResult(res);
      setFocusedPlaceId(res.places[0]?.id ?? null);
      setPhase("success");
    } catch (e) {
      console.error("fetchPlaceRecommendation error", e);
      if (!isMounted.current) return;
      setErrorMessage("추천 장소를 찾지 못했어요. 잠시 후 다시 시도해주세요.");
      setPhase("error");
    }
  }, [roomCode]);

  useEffect(() => {
    void runRecommendation();
  }, [runRecommendation]);

  // 투표 현황 폴링 (확정되면 중단)
  const refreshResults = useCallback(async () => {
    try {
      const r = await fetchVoteResults({ inviteCode: roomCode, voteType: "PLACE" });
      if (!isMounted.current) return;
      setVoteResults(r);
      finalizedRef.current = r.finalized;
    } catch (e) {
      console.error("fetchVoteResults error", e);
    }
  }, [roomCode]);

  useEffect(() => {
    if (phase !== "success") return;
    let canceled = false;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timer = setTimeout(async () => {
        await refreshResults();
        if (!canceled && !finalizedRef.current) schedule();
      }, 3000);
    };

    void refreshResults().then(() => {
      if (!canceled && !finalizedRef.current) schedule();
    });

    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [phase, refreshResults]);

  // 후보에 투표(재선택 시 변경 투표) 후 현황 즉시 갱신
  const handleVote = useCallback(
    (place: RecommendedPlace) => {
      selectVote(place.id);
      void submitVote(roomCode).then(() => void refreshResults());
    },
    [selectVote, submitVote, roomCode, refreshResults],
  );

  // 호스트 확정 성공 — 승자는 서버 재집계 결과(finalCandidateId)에서 온다.
  const handleResolved = useCallback(
    (finalCandidateId: string) => {
      const winner = result?.places.find((p) => p.id === finalCandidateId);
      if (winner) {
        if (typeof window !== "undefined") {
          // 식당 추천이 읽는 place_candidate_id(숫자 문자열)
          localStorage.setItem(`moyeo_place_${roomCode}`, winner.id);
        }
        void setMeetingLocation({
          code: roomCode,
          location: {
            label: winner.name,
            roadAddress: winner.category ?? winner.name,
            lat: winner.lat,
            lng: winner.lng,
          },
        });
      }
      router.push(`/rooms/${roomCode}/curation`);
    },
    [result, roomCode, router],
  );

  const candidateName = useCallback(
    (id: string) => result?.places.find((p) => p.id === id)?.name ?? id,
    [result],
  );

  const focusedPlace = useMemo(
    () =>
      result?.places.find((p) => p.id === focusedPlaceId) ?? result?.places[0] ?? null,
    [result, focusedPlaceId],
  );

  // 캐러셀 — 가로 스크롤 위치로 중앙 카드를 판별한다.
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const scrollRaf = useRef<number | null>(null);

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

  const scrollToPlace = useCallback((id: string) => {
    cardRefs.current.get(id)?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, []);

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
    nearest?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

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

  const isFinalized = voteResults?.finalized ?? false;
  const countOf = (id: string) =>
    voteResults?.tally.find((t) => t.candidateId === id)?.count;

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
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* 제목 */}
          <div className="animate-fade-up px-5 pb-3 pt-5">
            <h1 className="text-[22px] font-bold tracking-tight text-gray-900">
              마음에 드는 장소에 투표하세요
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              좌우로 넘겨 후보를 비교하고 투표하세요. 언제든 바꿀 수 있어요.
            </p>
          </div>

          {result.calculationMethod === "DISTANCE_FALLBACK" && <FallbackNotice />}

          {/* 지도 */}
          <div className="mx-5 mt-3 h-[36vh] flex-shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
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
                  p.id === focusedPlace.id ? "w-4 bg-primary" : "w-1.5 bg-primary/20",
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
            className="flex flex-shrink-0 cursor-grab snap-x snap-mandatory select-none gap-3 overflow-x-auto px-[10%] py-3 active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                  isMyVote={submittedCandidateId === p.id}
                  count={countOf(p.id)}
                  disabled={isSubmitting || isFinalized}
                  onVote={() => handleVote(p)}
                />
              </div>
            ))}
          </div>

          {/* 투표 현황 + 동률 중재 */}
          <div className="px-5 pb-6 pt-2">
            <VoteResultsPanel
              voteType="PLACE"
              results={voteResults}
              isHost={role.isHost}
              meetingId={meetingId}
              candidateName={candidateName}
              onResolved={handleResolved}
            />

            {isFinalized && !role.isHost && (
              <Button
                onClick={() => router.push(`/rooms/${roomCode}`)}
                className="mt-3 h-12 w-full rounded-2xl text-sm font-semibold"
              >
                모임 현황으로 가기
              </Button>
            )}
          </div>
        </div>
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
                  <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
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
