"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { shareLink } from "@/shared/lib/share";
import { useRoomCreateStore } from "../model/store";

export function Step4ShareLink() {
  const router = useRouter();
  const roomCode = useRoomCreateStore((s) => s.roomCode);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  if (!roomCode) return null;

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/rooms/${encodeURIComponent(roomCode)}`
      : `/rooms/${encodeURIComponent(roomCode)}`;

  const handleShare = async () => {
    const result = await shareLink(url);
    if (result === "shared") setShareStatus("공유되었어요");
    else if (result === "copied") setShareStatus("복사되었어요");
    else setShareStatus("공유에 실패했어요. 다시 시도해주세요.");
  };

  const handleGoToRoom = () => {
    router.push(`/rooms/${encodeURIComponent(roomCode)}`);
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="mt-12 mb-12 text-center">
        <h1 className="text-2xl font-bold">모임 생성이 완료되었어요.</h1>
      </header>

      <div className="space-y-4">
        <p className="text-center text-base font-medium">
          모임 링크를 공유하세요.
        </p>

        <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {roomCode}
        </div>

        <Button
          onClick={handleShare}
          variant="secondary"
          className="w-full rounded-full"
        >
          <Sparkles className="mr-1.5 h-4 w-4" />
          링크 복사하기
        </Button>

        <Button onClick={handleGoToRoom} className="w-full rounded-full">
          모임 현황 확인하기
        </Button>

        {shareStatus && (
          <p className="text-center text-xs text-muted-foreground">
            {shareStatus}
          </p>
        )}
      </div>
    </div>
  );
}
