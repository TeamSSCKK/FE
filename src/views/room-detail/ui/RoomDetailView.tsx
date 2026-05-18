"use client";

import { useEffect, useState } from "react";
import { RoomStatusWidget } from "@/widgets/room-status";
import { loadMemberId } from "@/shared/lib/room-session";

interface Props {
  roomCode: string;
}

export function RoomDetailView({ roomCode }: Props) {
  const [memberId, setMemberId] = useState<string | undefined | null>(null);

  useEffect(() => {
    setMemberId(loadMemberId(roomCode) ?? undefined);
  }, [roomCode]);

  if (memberId === null) return null;

  return (
    <main className="flex flex-1 flex-col">
      <RoomStatusWidget roomCode={roomCode} currentMemberId={memberId} />
    </main>
  );
}
