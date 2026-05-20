"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { fetchRoomStatus } from "@/entities/room/api/fetch-room-status";
import { updateMemberPreference } from "@/entities/room/api/update-member-preference";
import {
  DEFAULT_PREFERENCE_TAGS,
  DEFAULT_RESTRICTION_TAGS,
} from "@/entities/room/model/preference-constants";
import type { Room } from "@/entities/room/model/types";
import { loadMemberId } from "@/shared/lib/room-session";
import { formatKoreanDateTime } from "@/shared/lib/format-datetime";
import { PreferenceForm } from "@/features/preference-input/ui/PreferenceForm";
import { usePreferenceInputStore } from "@/features/preference-input/model/store";

interface Props {
  code: string;
}

export function RoomPreferenceView({ code }: Props) {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const setSubmitting = usePreferenceInputStore((s) => s.setSubmitting);
  const setError = usePreferenceInputStore((s) => s.setError);
  const hydrateFromMember = usePreferenceInputStore((s) => s.hydrateFromMember);
  const tagStates = usePreferenceInputStore((s) => s.tagStates);
  const restrictionStates = usePreferenceInputStore((s) => s.restrictionStates);
  const reset = usePreferenceInputStore((s) => s.reset);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await fetchRoomStatus(code);
        if (cancelled) return;
        setRoom(status.room);

        let mid = loadMemberId(code);
        if (!mid) {
          if (
            typeof window !== "undefined" &&
            localStorage.getItem(`room-${code}`)
          ) {
            const host = status.members.find((m) => m.isHost);
            if (host) mid = host.id;
          }
        }
        if (!mid) {
          router.replace(`/rooms/${code}`);
          return;
        }
        setMemberId(mid);

        const me = status.members.find((m) => m.id === mid);
        if (me?.preference) {
          hydrateFromMember(
            me.preference.tags.map((t) => ({ id: t.id, tone: t.tone })),
            me.preference.restrictions.map((r) => ({ id: r.id })),
          );
        } else {
          reset();
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : "방을 불러올 수 없어요.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, router, hydrateFromMember, reset]);

  const findPrefLabel = (id: string) =>
    DEFAULT_PREFERENCE_TAGS.find((t) => t.id === id)?.label ?? id;
  const findResLabel = (id: string) =>
    DEFAULT_RESTRICTION_TAGS.find((t) => t.id === id)?.label ?? id;

  const handleSubmit = async () => {
    if (!memberId) return;
    setSubmitting(true);
    setError(null);
    try {
      const tags = Object.entries(tagStates)
        .filter(([, s]) => s !== "neutral")
        .map(([id, s]) => ({
          id,
          label: findPrefLabel(id),
          tone: s as "like" | "dislike",
        }));
      const restrictions = Object.entries(restrictionStates)
        .filter(([, v]) => v)
        .map(([id]) => ({ id, label: findResLabel(id) }));
      await updateMemberPreference({
        code,
        memberId,
        preference: { tags, restrictions },
      });
      router.push(`/rooms/${code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) return <div className="p-8 text-red-500">{loadError}</div>;
  if (!room) return <div className="p-8 text-gray-500">불러오는 중...</div>;

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* 헤더 — RoomLocationView 패턴 그대로 */}
      <header className="flex items-center gap-2 border-b border-border/30 px-2 py-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition active:scale-90"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[12px] text-muted-foreground">
            {room.name} · {formatKoreanDateTime(room.dateTime)}
          </p>
        </div>
        <div className="h-9 w-9" aria-hidden />
      </header>

      <div className="px-5">
        <h1 className="mt-6 text-2xl font-bold">오늘은 뭐가 당기나요?</h1>
        <p className="mt-1 text-sm text-gray-500">
          당신의 음식 취향을 반영한 식당을 추천드릴게요.
        </p>
        <div className="mt-8">
          <PreferenceForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
