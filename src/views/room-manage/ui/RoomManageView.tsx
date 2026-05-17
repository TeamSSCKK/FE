"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Share2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { shareLink } from "@/shared/lib/share";
import { loadMemberId } from "@/shared/lib/room-session";
import { formatKoreanDateTime } from "@/shared/lib/format-datetime";
import {
  fetchRoomStatus,
  deleteMember,
  type RoomStatus,
} from "@/entities/room";

interface Props {
  roomCode: string;
}

export function RoomManageView({ roomCode }: Props) {
  const router = useRouter();
  const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await fetchRoomStatus(roomCode);
      setRoomStatus(status);

      const memberId = loadMemberId(roomCode);
      const me = memberId
        ? status.members.find((m) => m.id === memberId)
        : null;
      if (!me?.isHost) {
        router.replace(`/rooms/${roomCode}`);
      }
    } catch (e) {
      console.error("fetchRoomStatus error", e);
    } finally {
      setIsLoading(false);
    }
  }, [roomCode, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (memberId: string) => {
    setIsDeletingId(memberId);
    try {
      await deleteMember({ code: roomCode, memberId });
      await load();
    } catch (e) {
      console.error("deleteMember error", e);
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/rooms/${roomCode}`;
    await shareLink(url);
  };

  if (isLoading || !roomStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center gap-2 border-b border-border/30 px-2 py-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition active:scale-90"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground">
            {formatKoreanDateTime(roomStatus.room.dateTime)}
          </p>
          <h1 className="truncate text-[16px] font-bold tracking-tight text-gray-900">
            {roomStatus.room.name}
          </h1>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[12px] text-primary transition active:scale-95"
        >
          <Share2 className="h-4 w-4" />
          링크 공유
        </button>
      </header>

      <div className="flex-1 px-5 py-6">
        <h2 className="text-[24px] font-bold tracking-tight text-gray-900">
          참가자 관리
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          참가자 {roomStatus.members.length}명
        </p>

        <div className="mt-4 space-y-2 rounded-2xl bg-primary/[0.04] p-3">
          {roomStatus.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {member.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {member.name}
                    </p>
                    {member.isHost && (
                      <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                        주최자
                      </span>
                    )}
                  </div>
                  {member.location?.label && (
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {member.location.label}
                    </p>
                  )}
                </div>
              </div>

              {!member.isHost && (
                <Button
                  type="button"
                  onClick={() => handleDelete(member.id)}
                  disabled={isDeletingId === member.id}
                  variant="secondary"
                  className="h-8 flex-shrink-0 rounded-xl px-3 text-[12px] disabled:opacity-50"
                >
                  {isDeletingId === member.id ? "삭제 중..." : "삭제"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
