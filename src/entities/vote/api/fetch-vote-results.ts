import axios from "axios";
import { apiClient } from "@/shared/api/axios-instance";
import type { VoteResults, VoteType } from "../model/types";

/** 현재 투표 현황을 조회한다(읽기 전용). inviteCode(=room code)로 폴링한다. */
export async function fetchVoteResults(params: {
  inviteCode: string;
  voteType: VoteType;
}): Promise<VoteResults> {
  try {
    const res = await apiClient.post<VoteResults>(
      "/functions/v1/get-vote-results",
      {
        inviteCode: params.inviteCode,
        voteType: params.voteType,
      },
    );
    return res.data;
  } catch (e) {
    // get-vote-results 미배포(404) 시 Supabase REST 직접 집계 폴백을 사용한다.
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      const res = await fetch(
        `/api/rooms/${encodeURIComponent(params.inviteCode)}/vote-results?voteType=${params.voteType}`,
        { cache: "no-store" },
      );
      if (res.ok) return (await res.json()) as VoteResults;
    }
    throw e;
  }
}
