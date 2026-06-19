import { apiClient } from "@/shared/api/axios-instance";
import type { VoteResults, VoteType } from "../model/types";

/** 현재 투표 현황을 조회한다(읽기 전용). inviteCode(=room code)로 폴링한다. */
export async function fetchVoteResults(params: {
  inviteCode: string;
  voteType: VoteType;
}): Promise<VoteResults> {
  const res = await apiClient.post<VoteResults>("/functions/v1/get-vote-results", {
    inviteCode: params.inviteCode,
    voteType: params.voteType,
  });
  return res.data;
}
