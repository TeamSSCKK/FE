import { apiClient } from "@/shared/api/axios-instance";
import type { CandidateTally, VoteType } from "@/entities/vote";

/** close-vote 응답(HTTP 200 판별 유니온). */
export type CloseVoteResult =
  | { resolved: true; status: string; finalCandidateId: string; tally: CandidateTally[] }
  | { resolved: false; reason: "TIE" | "NO_VOTES"; topCandidates?: string[]; tally: CandidateTally[] };

/** 투표를 기록한다(재호출 시 백엔드가 기존 투표를 교체). */
export async function castVote(params: {
  meetingId: string;
  participantId: string;
  candidateId: string;
  voteType: VoteType;
}): Promise<void> {
  await apiClient.post("/functions/v1/cast-vote", {
    meetingId: params.meetingId,
    participantId: params.participantId,
    candidateId: params.candidateId,
    voteType: params.voteType,
  });
}

/**
 * 투표를 종료하고 확정한다.
 * - finalCandidateId 생략: 단독 1위면 자동 확정(resolved:true), 동률이면 resolved:false(reason:"TIE").
 * - finalCandidateId 지정: 주최자가 동률 중재로 선택(서버가 재집계로 검증).
 */
export async function closeVote(params: {
  meetingId: string;
  voteType: VoteType;
  finalCandidateId?: string;
}): Promise<CloseVoteResult> {
  const res = await apiClient.post<CloseVoteResult>("/functions/v1/close-vote", {
    meetingId: params.meetingId,
    voteType: params.voteType,
    finalCandidateId: params.finalCandidateId,
  });
  return res.data;
}
