"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { TopBar } from "@/shared/ui/top-bar";
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
    else if (result === "copied") setShareStatus("링크가 복사되었어요");
    else setShareStatus("공유에 실패했어요. 다시 시도해주세요");
  };

  const handleGoToRoom = () => {
    router.push(`/rooms/${encodeURIComponent(roomCode)}`);
  };

  return (
    <div className="flex flex-1 flex-col">
      <TopBar onBack={() => router.push("/")} />

      <div className="flex-1 px-5">
        <div className="mt-6 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 animate-scale-in items-center justify-center rounded-full bg-primary/10">
            <Check
              className="h-8 w-8 text-primary"
              strokeWidth={2.75}
            />
          </div>
          <h1
            className="animate-fade-up text-[26px] font-bold leading-snug tracking-tight"
            style={{ animationDelay: "120ms" }}
          >
            모임이 만들어졌어요
          </h1>
          <p
            className="mt-2 animate-fade-up text-[13px] text-muted-foreground"
            style={{ animationDelay: "200ms" }}
          >
            링크를 친구들에게 공유해보세요
          </p>
        </div>

        <div
          className="mt-10 animate-fade-up rounded-2xl bg-primary/[0.08] px-5 py-7 text-center"
          style={{ animationDelay: "280ms" }}
        >
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
            모임 코드
          </p>
          <p className="font-mono text-[18px] font-bold tracking-[0.08em] text-primary">
            {roomCode}
          </p>
        </div>

        {shareStatus && (
          <p className="mt-4 animate-fade-up text-center text-xs text-muted-foreground">
            {shareStatus}
          </p>
        )}
      </div>

      <div
        className="sticky bottom-0 animate-fade-up space-y-2 bg-background px-5 pb-6 pt-3"
        style={{ animationDelay: "360ms" }}
      >
        <Button
          onClick={handleShare}
          variant="secondary"
          className="h-14 w-full rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] active:opacity-95"
        >
          링크 복사하기
        </Button>
        <Button
          onClick={handleGoToRoom}
          className="h-14 w-full rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] active:opacity-95"
        >
          모임 현황 확인하기
        </Button>
      </div>
    </div>
  );
}
