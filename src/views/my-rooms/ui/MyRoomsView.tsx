"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/shared/ui/top-bar";
import { fetchMyRooms, type RoomStatus } from "@/entities/room";
import { MyRoomCard } from "./MyRoomCard";

type State =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "list"; rooms: RoomStatus[] };

export function MyRoomsView() {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchMyRooms().then((rooms) => {
      if (cancelled) return;
      setState(rooms.length === 0 ? { kind: "empty" } : { kind: "list", rooms });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="relative flex flex-1 flex-col">
      <TopBar onBack={() => router.push("/")} />
      <div className="sticky top-14 z-[5] bg-background/85 px-5 pb-4 pt-2 backdrop-blur-md">
        <h1 className="animate-fade-up text-[28px] font-bold leading-tight tracking-tight">
          내 모임
        </h1>
        <p
          className="mt-3 animate-fade-up text-[14px] leading-relaxed text-muted-foreground"
          style={{ animationDelay: "120ms" }}
        >
          참여 중인 모임을 모아볼 수 있어요.
        </p>
      </div>

      {state.kind === "loading" && (
        <div
          className="mt-4 flex animate-fade-up flex-col gap-3 px-5"
          style={{ animationDelay: "200ms" }}
        >
          <div className="h-[104px] animate-pulse rounded-2xl bg-neutral-100" />
          <div className="h-[104px] animate-pulse rounded-2xl bg-neutral-100" />
        </div>
      )}

      {state.kind === "empty" && (
        <div
          className="flex flex-1 animate-fade-up items-center justify-center px-5"
          style={{ animationDelay: "200ms" }}
        >
          <p className="text-[14px] text-muted-foreground">
            아직 참여 중인 모임이 없어요.
          </p>
        </div>
      )}

      {state.kind === "list" && (
        <div
          className="mt-4 flex animate-fade-up flex-col gap-3 px-5 pb-8"
          style={{ animationDelay: "200ms" }}
        >
          {state.rooms.map((status) => (
            <MyRoomCard key={status.room.code} status={status} />
          ))}
        </div>
      )}
    </main>
  );
}
