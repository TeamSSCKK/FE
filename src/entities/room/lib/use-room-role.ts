"use client";

import { useEffect, useState } from "react";
import { fetchRoomStatus } from "../api/fetch-room-status";
import type { RoomStatus } from "../model/types";
import { loadMemberId, saveMemberId } from "@/shared/lib/room-session";

interface UseRoomRoleResult {
  roomStatus: RoomStatus | null;
  memberId: string | null;
  isHost: boolean;
  /** meeting.status (예: PLACE_VOTING, RESTAURANT_VOTING) */
  status: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * 비-리다이렉트 역할 판정 훅. (호스트 전용 화면 가드 useHostGuard와 달리 멤버를 튕기지 않는다.)
 *
 * host 판정의 단일 진실원천은 `moyeo_creator_<code>`이다(fetch-room-status가 이 키로 member.isHost를 산출).
 * 세션 memberId가 없거나 stale이면 `moyeo_creator_<code>` 기준으로만 재흡수한다.
 * `room-<code>`는 단순 meetingLocation JSON이므로 host 신호로 사용하지 않는다.
 * (한계: moyeo_creator_<code>가 완전히 소거되면 클라이언트만으로는 host 복구 불가.)
 */
export function useRoomRole(code: string): UseRoomRoleResult {
  const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        const s = await fetchRoomStatus(code);
        if (canceled) return;

        let mid = loadMemberId(code);
        if (!mid || !s.members.some((m) => m.id === mid)) {
          const creatorId =
            typeof window !== "undefined"
              ? localStorage.getItem(`moyeo_creator_${code}`)
              : null;
          if (creatorId && s.members.some((m) => m.id === creatorId)) {
            saveMemberId(code, creatorId);
            mid = creatorId;
          }
        }

        setRoomStatus(s);
        setMemberId(mid ?? null);
      } catch (e) {
        if (!canceled) {
          setError(e instanceof Error ? e.message : "방을 불러올 수 없어요.");
        }
      } finally {
        if (!canceled) setIsLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [code]);

  const me =
    memberId && roomStatus
      ? roomStatus.members.find((m) => m.id === memberId)
      : undefined;

  return {
    roomStatus,
    memberId,
    isHost: me?.isHost ?? false,
    status: roomStatus?.room.status ?? null,
    isLoading,
    error,
  };
}
