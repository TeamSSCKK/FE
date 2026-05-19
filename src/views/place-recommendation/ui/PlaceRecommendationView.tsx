"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MapPin, AlertTriangle } from "lucide-react";
import { fetchRoomStatus, type Room } from "@/entities/room";
import { fetchPlaceRecommendation } from "@/entities/place-recommendation";
import { formatKoreanDateTime } from "@/shared/lib/format-datetime";
import { Button } from "@/shared/ui/button";

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
      await fetchPlaceRecommendation(roomCode);
      if (!isMounted.current) return;
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

  return (
    <div className="flex min-h-screen flex-col bg-white">
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

      {/* 제목 블록 */}
      <div className="animate-fade-up px-5 pt-8">
        <h1 className="text-[28px] font-bold tracking-tight text-gray-900">
          모임 장소 추천
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          모두에게 공정한 장소를 추천해드려요.
        </p>
      </div>

      {/* 중앙 영역 */}
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

        {phase === "success" && (
          <div className="animate-fade-up rounded-2xl bg-primary/[0.05] px-8 py-10 text-center">
            <p className="text-base font-semibold text-gray-900">
              추천이 완료되었어요
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              추천 결과 화면은 준비 중입니다.
            </p>
          </div>
        )}
      </div>

      {/* 하단 안내 — 로딩 중에만 */}
      {phase === "loading" && (
        <p className="animate-fade-up px-5 pb-10 text-center text-[13px] text-muted-foreground">
          최적의 장소를 찾기 위해 열심히 검색하고 있어요.
        </p>
      )}
    </div>
  );
}
