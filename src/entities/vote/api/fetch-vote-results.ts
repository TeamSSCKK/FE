import axios from "axios";
import { apiClient } from "@/shared/api/axios-instance";
import { loadSessionData } from "@/shared/lib/room-session";
import type { VoteResults, VoteType } from "../model/types";

/**
 * 현재 투표 현황을 조회한다(읽기 전용). inviteCode(=room code)로 폴링한다.
 * 세션에 participantId가 있으면 함께 보내 myCandidateId(내 투표)도 받아온다.
 */
export async function fetchVoteResults(params: {
  inviteCode: string;
  voteType: VoteType;
}): Promise<VoteResults> {
  const participantId = loadSessionData(params.inviteCode)?.participantId;
  try {
    const res = await apiClient.post<VoteResults>(
      "/functions/v1/get-vote-results",
      {
        inviteCode: params.inviteCode,
        voteType: params.voteType,
        participantId,
      },
    );
    return res.data;
  } catch (e) {
    // get-vote-results 미배포(404) 시 Supabase REST 직접 집계 폴백을 사용한다.
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      const query = new URLSearchParams({ voteType: params.voteType });
      if (participantId) query.set("participantId", participantId);
      const res = await fetch(
        `/api/rooms/${encodeURIComponent(params.inviteCode)}/vote-results?${query.toString()}`,
        { cache: "no-store" },
      );
      if (res.ok) return (await res.json()) as VoteResults;
    }
    throw e;
  }
}
