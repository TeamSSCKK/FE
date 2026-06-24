"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useRoomRole } from "@/entities/room";
import { useVoteActionStore } from "@/features/vote-action";
import { fetchVoteResults, type VoteResults } from "@/entities/vote";
import { VoteResultsPanel } from "@/widgets/vote-results";
import { fetchRestaurantRecommendation } from "@/entities/restaurant-recommendation/api/fetch-restaurant-recommendation";
import { fetchRestaurantCandidates } from "@/entities/restaurant-recommendation/api/fetch-restaurant-candidates";
import type {
  ConfirmedPlace,
  RecommendedRestaurant,
} from "@/entities/restaurant-recommendation/model/types";
import { NaverMap, type MapMarker } from "@/widgets/naver-map";
import { loadSessionData } from "@/shared/lib/room-session";
import { cn } from "@/shared/lib/utils";

interface Props {
  code: string;
  /**
   * generate: 호스트 큐레이션 경로 — 추천을 생성한다(recommend-restaurants).
   * vote: 투표 화면 — 저장된 후보만 읽는다(생성 트리거 없음). 기본값.
   */
  mode?: "generate" | "vote";
}

type Phase = "loading" | "success" | "error";

export function RestaurantRecommendationView({ code, mode = "vote" }: Props) {
  const router = useRouter();
  const role = useRoomRole(code);
  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [restaurants, setRestaurants] = useState<RecommendedRestaurant[]>([]);
  const [confirmedPlace, setConfirmedPlace] = useState<ConfirmedPlace | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);

  // 투표 스토어 (RESTAURANT)
  const initVote = useVoteActionStore((s) => s.init);
  const selectVote = useVoteActionStore((s) => s.select);
  const submitVote = useVoteActionStore((s) => s.submit);
  const submittedCandidateId = useVoteActionStore((s) => s.submittedCandidateId);
  const isSubmitting = useVoteActionStore((s) => s.isSubmitting);
  const setSubmitted = useVoteActionStore((s) => s.setSubmitted);

  const [voteResults, setVoteResults] = useState<VoteResults | null>(null);
  const [pollFinalized, setPollFinalized] = useState(false);

  useEffect(() => {
    initVote("RESTAURANT");
  }, [initVote]);

  // meetingId: 세션 우선, 없으면 방 상태에서 폴백(세션 유실된 재흡수 호스트 대비)
  useEffect(() => {
    const fromSession = loadSessionData(code)?.meetingId ?? null;
    if (fromSession) {
      setMeetingId(fromSession);
    } else if (role.roomStatus?.room.meetingId) {
      setMeetingId(role.roomStatus.room.meetingId);
    }
  }, [code, role.roomStatus]);

  // 확정 장소 id는 백엔드 final_decision 기반 값을 우선 사용한다(localStorage 폴백은 fetch 내부).
  const finalPlaceCandidateId = role.roomStatus?.room.finalPlaceCandidateId;

  // 역할 해소(로딩 종료) 후에만 fetch — 조기 발화 방지.
  // vote 모드: 저장된 후보만 읽는다(생성 안 함). generate 모드: 추천을 생성한다.
  useEffect(() => {
    if (role.isLoading) return;
    // vote 모드는 확정 장소 id가 있어야 후보를 읽을 수 있다. 아직이면 대기(도착 시 재실행).
    if (mode === "vote" && !finalPlaceCandidateId) return;
    let canceled = false;

    (async () => {
      try {
        const result =
          mode === "vote"
            ? await fetchRestaurantCandidates(code, finalPlaceCandidateId ?? "")
            : await fetchRestaurantRecommendation(code, finalPlaceCandidateId);
        if (canceled) return;
        if (result.restaurants.length === 0) {
          setPhase("error");
          setErrorMessage("추천할 수 있는 식당이 없어요.");
          return;
        }
        setConfirmedPlace(result.place ?? null);
        setRestaurants(result.restaurants);
        setPhase("success");
      } catch (e) {
        console.error("restaurant recommendation fetch error", e);
        if (canceled) return;
        setErrorMessage("식당 추천 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
        setPhase("error");
      }
    })();

    return () => {
      canceled = true;
    };
  }, [code, role.isLoading, finalPlaceCandidateId, mode]);

  useEffect(() => {
    if (role.error) {
      setErrorMessage(role.error);
      setPhase("error");
    }
  }, [role.error]);

  // 투표 현황 폴링 (확정 시 중단)
  const refreshResults = useCallback(async () => {
    try {
      const r = await fetchVoteResults({ inviteCode: code, voteType: "RESTAURANT" });
      setVoteResults(r);
      setPollFinalized(r.finalized);
    } catch (e) {
      console.error("fetchVoteResults error", e);
    }
  }, [code]);

  useEffect(() => {
    if (phase !== "success") return;
    let canceled = false;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(async () => {
        await refreshResults();
        if (!canceled && !pollFinalized) schedule();
      }, 3000);
    };
    void refreshResults().then(() => {
      if (!canceled) schedule();
    });
    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [phase, refreshResults, pollFinalized]);

  // 서버가 알려준 내 투표(myCandidateId)로 "투표함" 하이라이트를 복원한다.
  // 재방문/타기기 진입 시에도 유지. 제출 중에는 낙관적 상태를 덮지 않는다.
  const myCandidateId = voteResults?.myCandidateId ?? null;
  useEffect(() => {
    if (isSubmitting) return;
    if (myCandidateId != null && myCandidateId !== submittedCandidateId) {
      setSubmitted(myCandidateId);
    }
  }, [myCandidateId, isSubmitting, submittedCandidateId, setSubmitted]);

  const totalCount = restaurants.length;
  const current = useMemo(() => restaurants[activeIndex], [restaurants, activeIndex]);

  const candidateName = useCallback(
    // 매칭 실패 시 원시 숫자 id 노출 방지(근본 해결은 후보 id 안정화). 방어선.
    (id: string) => restaurants.find((r) => r.id === id)?.name ?? "(알 수 없음)",
    [restaurants],
  );

  const handleVote = useCallback(() => {
    if (!current) return;
    selectVote(current.id);
    void submitVote(code).then(() => void refreshResults());
  }, [current, selectVote, submitVote, code, refreshResults]);

  const handleResolved = useCallback(() => {
    router.push(`/rooms/${code}`);
  }, [router, code]);

  const markers = useMemo<MapMarker[]>(() => {
    const list: MapMarker[] = [];
    if (confirmedPlace) {
      list.push({
        id: "meeting-place",
        lat: confirmedPlace.lat,
        lng: confirmedPlace.lng,
        variant: "member",
        label: confirmedPlace.name.charAt(0),
      });
    }
    restaurants.forEach((r, i) => {
      if (r.lat == null || r.lng == null) return;
      list.push({
        id: r.id,
        lat: r.lat,
        lng: r.lng,
        variant: i === activeIndex ? "place-focused" : "place",
        label: r.name,
      });
    });
    return list;
  }, [confirmedPlace, restaurants, activeIndex]);

  const mapCenter = useMemo(() => {
    if (current?.lat != null && current?.lng != null) {
      return { lat: current.lat, lng: current.lng };
    }
    if (confirmedPlace) {
      return { lat: confirmedPlace.lat, lng: confirmedPlace.lng };
    }
    return null;
  }, [current, confirmedPlace]);

  const handlePrev = () => setActiveIndex((i) => (i - 1 + totalCount) % totalCount);
  const handleNext = () => setActiveIndex((i) => (i + 1) % totalCount);

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
          마음에 드는 식당에 투표하세요
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {activeIndex + 1} / {totalCount} · 좌우 화살표로 후보를 비교하세요.
        </p>
      </div>

      <div className="mx-5 mt-4 h-[36vh] flex-shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
        {mapCenter ? (
          <NaverMap center={mapCenter} markers={markers} showCenterPin={false} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <MapPin className="h-8 w-8" />
              <p className="text-xs">지도 정보 없음</p>
            </div>
          </div>
        )}
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
          <p className="mt-1 text-base font-bold text-gray-900">{current.name}</p>
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

      {/* 현재 식당에 투표 */}
      <div className="px-5 pt-4">
        <button
          type="button"
          onClick={handleVote}
          disabled={isSubmitting || (voteResults?.finalized ?? false)}
          className={cn(
            "w-full rounded-full py-4 text-sm font-semibold active:scale-[0.98] disabled:opacity-60",
            submittedCandidateId === current.id
              ? "bg-purple-100 text-purple-700"
              : "bg-purple-600 text-white hover:bg-purple-700",
          )}
        >
          {submittedCandidateId === current.id
            ? "투표함 · 변경하려면 다른 식당 투표"
            : "이 식당에 투표"}
        </button>
      </div>

      {/* 투표 현황 + 동률 중재 */}
      <div className="px-5 pb-6 pt-3">
        <VoteResultsPanel
          voteType="RESTAURANT"
          results={voteResults}
          isHost={role.isHost}
          roomCode={code}
          meetingId={meetingId}
          candidateName={candidateName}
          onResolved={handleResolved}
        />
        {(voteResults?.finalized ?? false) && !role.isHost && (
          <button
            type="button"
            onClick={() => router.push(`/rooms/${code}`)}
            className="mt-3 w-full rounded-full bg-purple-600 py-4 text-sm font-semibold text-white hover:bg-purple-700"
          >
            모임 현황으로 가기
          </button>
        )}
      </div>
    </div>
  );
}
