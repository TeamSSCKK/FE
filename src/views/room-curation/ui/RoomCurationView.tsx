"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Map } from "lucide-react";
import { useHostGuard } from "@/entities/room";
import { formatKoreanDateTime } from "@/shared/lib/format-datetime";

interface Props {
  roomCode: string;
}

interface CurationCardProps {
  caption: string;
  title: string;
  delay: number;
  onClick: () => void;
}

/** 큐레이션 선택 카드 */
function CurationCard({ caption, title, delay, onClick }: CurationCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className="flex w-full animate-fade-up flex-col items-center gap-3 rounded-3xl bg-primary/[0.05] px-6 py-9 text-center transition active:scale-[0.97]"
    >
      <Map className="h-10 w-10 text-primary" strokeWidth={1.75} />
      <span className="text-[13px] text-muted-foreground">{caption}</span>
      <span className="text-[22px] font-bold tracking-tight text-gray-900">
        {title}
      </span>
    </button>
  );
}

export function RoomCurationView({ roomCode }: Props) {
  const router = useRouter();
  const { status, isReady, error } = useHostGuard(roomCode);
  const room = status?.room ?? null;

  // 추천 결과 화면은 아직 준비 중 — 공통 안내만 처리
  const handleNotReady = useCallback(() => {
    alert("해당 기능은 준비 중입니다!");
  }, []);

  // 모임 식당 추천 — 모임 장소가 이미 정해져 있으면 추천 화면으로,
  // 아니면 장소 입력 단계부터 보낸다.
  const handleRestaurantClick = useCallback(() => {
    router.push(
      room?.meetingLocation
        ? `/rooms/${roomCode}/curation/restaurant`
        : `/rooms/${roomCode}/curation/restaurant-location`,
    );
  }, [roomCode, router, room?.meetingLocation]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

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
            {room
              ? `${room.name} · ${formatKoreanDateTime(room.dateTime)}`
              : ""}
          </p>
        </div>
        <div className="h-9 w-9" aria-hidden />
      </header>

      {/* 본문 */}
      <div className="flex-1 px-5 pt-10">
        <h1 className="animate-fade-up text-[26px] font-bold leading-snug tracking-tight text-gray-900">
          무엇을
          <br />
          도와드릴까요?
        </h1>
        <p
          className="mt-2 animate-fade-up text-sm text-muted-foreground"
          style={{ animationDelay: "80ms" }}
        >
          장소와 식당 중에 선택해주세요.
        </p>

        <div className="mt-10 space-y-5">
          <CurationCard
            caption="아직 모임 위치가 안 정해졌다면?"
            title="모임 위치 추천"
            delay={160}
            onClick={() => router.push(`/rooms/${roomCode}/curation/location`)}
          />
          <CurationCard
            caption="저희는 이미 장소를 정했어요."
            title="모임 식당 추천"
            delay={240}
            onClick={handleRestaurantClick}
          />
        </div>
      </div>
    </div>
  );
}
