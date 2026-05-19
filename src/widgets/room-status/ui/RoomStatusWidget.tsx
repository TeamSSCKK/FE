"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Share2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { formatKoreanDateTime } from "@/shared/lib/format-datetime";
import { saveMemberId } from "@/shared/lib/room-session";
import { cn } from "@/shared/lib/utils";
import {
  fetchRoomStatus,
  type RoomStatus,
  type Member,
} from "@/entities/room";
import { RoomJoinForm } from "@/features/room-join";

interface Props {
  roomCode: string;
  currentMemberId?: string;
}

/** 체크 셀: hasLocation / hasPreference / hasVoted */
function CheckCell({ filled }: { filled: boolean }) {
  return (
    <div
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg text-sm font-semibold transition",
        filled
          ? "bg-green-400 text-white"
          : "bg-primary/10 text-gray-500",
      )}
    >
      {filled ? <CheckCircle2 className="h-4 w-4" /> : "—"}
    </div>
  );
}

/** 멤버 행 컴포넌트 */
function MemberRow({
  member,
  onDelete,
  isDeleting,
  showDelete,
}: {
  member: Member;
  onDelete?: () => void;
  isDeleting?: boolean;
  showDelete?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {member.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">{member.name}</p>
          {member.isHost && (
            <span className="mt-0.5 inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
              주최자
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <CheckCell filled={member.hasLocation} />
        <CheckCell filled={member.hasPreference} />
        <CheckCell filled={member.hasVoted} />
      </div>

      {showDelete && !member.isHost && (
        <Button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          variant="secondary"
          className="h-8 rounded-xl px-3 text-[12px] disabled:opacity-50"
        >
          삭제
        </Button>
      )}
    </div>
  );
}

/** 메인 뷰 */
export function RoomStatusWidget({ roomCode, currentMemberId }: Props) {
  const router = useRouter();
  const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localMemberId, setLocalMemberId] = useState(currentMemberId);

  const loadRoomStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const status = await fetchRoomStatus(roomCode);
      setRoomStatus(status);
    } catch (error) {
      console.error("fetchRoomStatus error", error);
    } finally {
      setIsLoading(false);
    }
  }, [roomCode]);

  useEffect(() => {
    void loadRoomStatus();
  }, [loadRoomStatus]);

  const currentMember = useMemo(
    () =>
      roomStatus?.members.find((m) => m.id === localMemberId) ?? null,
    [roomStatus, localMemberId],
  );

  const mode = useMemo(() => {
    if (!localMemberId) return "guest";
    return currentMember?.isHost ? "host" : "member";
  }, [localMemberId, currentMember]);

  const progressPct = useMemo(() => {
    if (!roomStatus) return 0;
    return Math.round(
      ((roomStatus.locationInputCount + roomStatus.preferenceInputCount) /
        (roomStatus.totalCount * 2)) *
        100,
    );
  }, [roomStatus]);

  const hasIncompleteLocation = useMemo(
    () => !!roomStatus && roomStatus.locationInputCount < roomStatus.totalCount,
    [roomStatus],
  );

  const handleJoinSuccess = (memberId: string) => {
    saveMemberId(roomCode, memberId);
    setLocalMemberId(memberId);
  };

  // 취향 입력·내 정보 수정 화면이 아직 준비 중 — 안내만 공통으로 처리
  const handleNotReady = () => alert("해당 기능은 준비 중입니다!");

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/rooms/${roomCode}`,
      );
      alert("링크가 복사되었습니다.");
    } catch (error) {
      console.error("share error", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!roomStatus) {
    return (
      <div className="min-h-screen bg-white p-5">
        <div className="rounded-2xl bg-primary/[0.04] p-6 text-center text-sm text-muted-foreground">
          방을 불러오지 못했습니다.
        </div>
      </div>
    );
  }

  if (mode === "guest") {
    return (
      <div className="min-h-screen bg-white p-5">
        <div className="animate-fade-up">
          <RoomJoinForm roomCode={roomCode} onSuccess={handleJoinSuccess} />
        </div>
      </div>
    );
  }

  const participantCount = roomStatus.members.length;
  const emptySlots = Math.max(0, roomStatus.totalCount - participantCount);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 헤더 */}
      <div className="animate-fade-up border-b border-border/40 px-5 py-4">
        <p className="text-[11px] text-muted-foreground">
          {formatKoreanDateTime(roomStatus.room.dateTime)}
        </p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <h1 className="text-[24px] font-bold tracking-tight text-gray-900">
            {roomStatus.room.name}
          </h1>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[12px] text-primary transition active:scale-95"
          >
            <Share2 className="h-4 w-4" />
            링크 공유
          </button>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 space-y-4 p-5">
        {/* 인사말 및 버튼 */}
        <div className="animate-fade-up rounded-2xl bg-primary/[0.06] p-5">
          <p className="text-base font-semibold text-gray-900">
            <span className="text-primary">{currentMember?.name}</span> 님,
            반가워요.
          </p>
          {mode === "member" ? (
            <div className="mt-4 space-y-2">
              <Button
                onClick={() => router.push(`/rooms/${roomCode}/location`)}
                className="h-12 w-full rounded-2xl text-sm font-semibold active:scale-[0.97] active:opacity-95"
              >
                위치 입력하기
              </Button>
              <Button
                onClick={handleNotReady}
                variant="secondary"
                className="h-12 w-full rounded-2xl text-sm font-semibold active:scale-[0.97] active:opacity-95"
              >
                취향 입력하기
              </Button>
              <Button
                onClick={handleNotReady}
                variant="secondary"
                className="h-12 w-full rounded-2xl text-sm font-semibold active:scale-[0.97] active:opacity-95"
              >
                내 정보 수정하기
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <Button
                onClick={() => router.push(`/rooms/${roomCode}/location`)}
                className="h-12 w-full rounded-2xl text-sm font-semibold active:scale-[0.97] active:opacity-95"
              >
                위치 수정하기
              </Button>
              <Button
                onClick={handleNotReady}
                variant="secondary"
                className="h-12 w-full rounded-2xl text-sm font-semibold active:scale-[0.97] active:opacity-95"
              >
                취향 수정하기
              </Button>
              <Button
                onClick={handleNotReady}
                variant="secondary"
                className="h-12 w-full rounded-2xl text-sm font-semibold active:scale-[0.97] active:opacity-95"
              >
                내 정보 수정하기
              </Button>
            </div>
          )}
        </div>

        {/* 진행률 */}
        <div className="animate-fade-up rounded-2xl bg-primary/[0.04] p-4">
          <div className="flex justify-between text-[13px] font-medium text-gray-700">
            <span>전체 입력 진행률</span>
            <span>{progressPct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary/10">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 카운트 카드 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="animate-fade-up rounded-2xl bg-primary/[0.04] p-4">
            <p className="text-[11px] text-muted-foreground">위치 입력</p>
            <p className="mt-2 text-[20px] font-bold text-gray-900">
              {roomStatus.locationInputCount}/{roomStatus.totalCount}
            </p>
          </div>
          <div className="animate-fade-up rounded-2xl bg-primary/[0.04] p-4">
            <p className="text-[11px] text-muted-foreground">취향 입력</p>
            <p className="mt-2 text-[20px] font-bold text-gray-900">
              {roomStatus.preferenceInputCount}/{roomStatus.totalCount}
            </p>
          </div>
        </div>

        {/* 참가자 목록 */}
        <div className="animate-fade-up rounded-2xl bg-primary/[0.04] p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">
              참가자 {participantCount}명
            </p>
            {mode === "host" && (
              <button
                type="button"
                onClick={() => router.push(`/rooms/${roomCode}/manage`)}
                className="text-sm font-semibold text-primary transition active:scale-95"
              >
                참가자 관리
              </button>
            )}
          </div>

          <div className="space-y-3">
            {roomStatus.members.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}

            {Array.from({ length: emptySlots }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 rounded-2xl bg-white" />
            ))}
          </div>
        </div>

        {/* 경고 배너 */}
        {hasIncompleteLocation && (
          <div className="animate-fade-up flex gap-3 rounded-2xl bg-primary/[0.04] p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                아직 위치를 입력하지 않은 참가자가 있습니다.
              </p>
              <p className="text-xs text-muted-foreground">
                모든 참가자가 위치와 취향을 입력해야 추천이 시작됩니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

