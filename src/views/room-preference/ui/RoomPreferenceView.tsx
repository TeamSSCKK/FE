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
import { loadMemberId, saveMemberId } from "@/shared/lib/room-session";
import { formatKoreanDateTime } from "@/shared/lib/format-datetime";
import type { Room } from "@/entities/room/model/types";
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

  // 언마운트 시 다음 진입에 영향이 가지 않도록 스토어 초기화.
  useEffect(() => {
    return () => reset();
  }, [reset]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const status = await fetchRoomStatus(code);
        if (cancelled) return;
        setRoom(status.room);

        // sessionStorage의 id가 실제 멤버 목록과 일치하는 경우만 신뢰.
        // 호스트 단말이면 stale id를 host id로 재흡수한다 (RoomLocationView와 동일 패턴).
        const existingId = loadMemberId(code);
        if (existingId && status.members.some((m) => m.id === existingId)) {
          setMemberId(existingId);
          const me = status.members.find((m) => m.id === existingId);
          if (me?.preference) {
            hydrateFromMember(
              me.preference.tags.map((t) => ({ id: t.id, tone: t.tone })),
              me.preference.restrictions.map((r) => ({ id: r.id })),
            );
          } else {
            reset();
          }
          return;
        }

        if (typeof window !== "undefined" && localStorage.getItem(`room-${code}`)) {
          const host = status.members.find((m) => m.isHost);
          if (host) {
            saveMemberId(code, host.id);
            setMemberId(host.id);
            if (host.preference) {
              hydrateFromMember(
                host.preference.tags.map((t) => ({ id: t.id, tone: t.tone })),
                host.preference.restrictions.map((r) => ({ id: r.id })),
              );
            } else {
              reset();
            }
            return;
          }
        }

        router.replace(`/rooms/${code}`);
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

  const handleSubmit = async () => {
    if (!memberId) return;
    setSubmitting(true);
    setError(null);
    try {
      const tags = Object.entries(tagStates)
        .filter(([, s]) => s !== "neutral")
        .map(([id, s]) => ({
          id,
          label: DEFAULT_PREFERENCE_TAGS.find((t) => t.id === id)?.label ?? id,
          tone: s as "like" | "dislike",
        }));
      const restrictions = Object.entries(restrictionStates)
        .filter(([, v]) => v)
        .map(([id]) => ({
          id,
          label:
            DEFAULT_RESTRICTION_TAGS.find((t) => t.id === id)?.label ?? id,
        }));
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

  if (loadError) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">{loadError}</p>
      </div>
    );
  }

  if (!room || !memberId) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* 헤더 — RoomLocationView와 동일 인라인 패턴 */}
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

      <div className="px-5 pt-5">
        <h1 className="text-[24px] font-bold leading-tight tracking-tight">
          오늘은 뭐가 당기나요?
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          당신의 음식 취향을 반영한 식당을 추천드릴게요.
        </p>
      </div>

      <div className="px-5 pt-6">
        <PreferenceForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
