"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/shared/ui/top-bar";
import { fetchMyRooms, type RoomStatus } from "@/entities/room";
import { MyRoomCard } from "./MyRoomCard";

type Tab = "upcoming" | "done";

type State =
  | { kind: "loading" }
  | { kind: "loaded"; rooms: RoomStatus[] };

/** 모임 시각이 현재보다 과거면 완료(진행 후)로 본다. 시각 정보가 없으면 진행 전으로 둔다. */
function isDone(status: RoomStatus): boolean {
  const value = status.room.dateTime;
  if (!value) return false;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  return time < Date.now();
}

export function MyRoomsView() {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [tab, setTab] = useState<Tab>("upcoming");

  useEffect(() => {
    let cancelled = false;
    fetchMyRooms().then((rooms) => {
      if (cancelled) return;
      setState({ kind: "loaded", rooms });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const { upcoming, done } = useMemo(() => {
    const rooms = state.kind === "loaded" ? state.rooms : [];
    const upcoming: RoomStatus[] = [];
    const done: RoomStatus[] = [];
    for (const status of rooms) {
      (isDone(status) ? done : upcoming).push(status);
    }
    return { upcoming, done };
  }, [state]);

  const activeRooms = tab === "upcoming" ? upcoming : done;

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

        <div
          className="mt-4 flex animate-fade-up gap-1 rounded-full bg-neutral-100 p-1"
          style={{ animationDelay: "160ms" }}
          role="tablist"
        >
          <TabButton
            label="진행 전"
            count={upcoming.length}
            active={tab === "upcoming"}
            onClick={() => setTab("upcoming")}
          />
          <TabButton
            label="진행 후"
            count={done.length}
            active={tab === "done"}
            onClick={() => setTab("done")}
          />
        </div>
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

      {state.kind === "loaded" && activeRooms.length === 0 && (
        <div
          className="flex flex-1 animate-fade-up items-center justify-center px-5"
          style={{ animationDelay: "200ms" }}
        >
          <p className="text-[14px] text-muted-foreground">
            {tab === "upcoming"
              ? "진행 예정인 모임이 없어요."
              : "완료된 모임이 없어요."}
          </p>
        </div>
      )}

      {state.kind === "loaded" && activeRooms.length > 0 && (
        <div
          className="mt-4 flex animate-fade-up flex-col gap-3 px-5 pb-8"
          style={{ animationDelay: "200ms" }}
        >
          {activeRooms.map((status) => (
            <MyRoomCard key={status.room.code} status={status} />
          ))}
        </div>
      )}
    </main>
  );
}

interface TabButtonProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, count, active, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[13px] font-semibold transition-all duration-150 ${
        active
          ? "bg-white text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-1.5 text-[11px] font-semibold ${
          active ? "bg-primary/10 text-primary" : "bg-neutral-200 text-neutral-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
