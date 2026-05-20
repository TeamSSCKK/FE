"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchRoomStatus } from "../api/fetch-room-status";
import type { RoomStatus } from "../model/types";
import { loadMemberId, saveMemberId } from "@/shared/lib/room-session";

interface UseHostGuardResult {
  status: RoomStatus | null;
  memberId: string | null;
  isReady: boolean;
  error: string | null;
}

/**
 * 호스트 전용 화면 가드.
 *
 * 1) fetchRoomStatus(code)로 방 상태를 조회한다.
 * 2) sessionStorage의 memberId가 멤버 목록과 일치하면 그대로 사용한다.
 * 3) memberId가 없거나 stale인데 localStorage `room-${code}`(호스트 단말 플래그)가 있으면,
 *    호스트 id를 sessionStorage에 재흡수한다.
 * 4) 그래도 호스트가 아니면 `/rooms/${code}`로 리다이렉트한다.
 *
 * 성공 시 `isReady=true`, `status`/`memberId`가 채워진다.
 * 네트워크 실패 시 `error`에 메시지가 담긴다.
 */
export function useHostGuard(code: string): UseHostGuardResult {
  const router = useRouter();
  const [status, setStatus] = useState<RoomStatus | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        const s = await fetchRoomStatus(code);
        if (canceled) return;

        let mid = loadMemberId(code);
        if (!mid || !s.members.some((m) => m.id === mid)) {
          if (
            typeof window !== "undefined" &&
            localStorage.getItem(`room-${code}`)
          ) {
            const host = s.members.find((m) => m.isHost);
            if (host) {
              saveMemberId(code, host.id);
              mid = host.id;
            }
          }
        }

        const me = mid ? s.members.find((m) => m.id === mid) : undefined;
        if (!me?.isHost) {
          router.replace(`/rooms/${code}`);
          return;
        }

        setStatus(s);
        setMemberId(mid);
        setIsReady(true);
      } catch (e) {
        if (!canceled) {
          setError(e instanceof Error ? e.message : "방을 불러올 수 없어요.");
        }
      }
    })();

    return () => {
      canceled = true;
    };
  }, [code, router]);

  return { status, memberId, isReady, error };
}
