import { apiClient } from "@/shared/api/axios-instance";
import type { VoteType } from "@/entities/vote";

/** closeVote 정규화 결과. 백엔드 close-vote는 200 시 확정 성공이다. */
export type CloseVoteResult =
  | { resolved: true; status: string; finalCandidateId: string }
  | { resolved: false; reason: "TIE" | "NO_VOTES" };

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
 *
 * 백엔드 close-vote는 finalCandidateId를 **항상 요구**하며(자동 확정 없음),
 * 성공 시 `{ message, status }`만 반환한다. 동률 판정은 호출부에서 마치고
 * 확정할 후보 id를 반드시 넘긴다. 200이면 확정 성공으로 정규화한다.
 */
export async function closeVote(params: {
  meetingId: string;
  voteType: VoteType;
  finalCandidateId: string;
}): Promise<CloseVoteResult> {
  const res = await apiClient.post<{ message?: string; status?: string }>(
    "/functions/v1/close-vote",
    {
      meetingId: params.meetingId,
      voteType: params.voteType,
      finalCandidateId: params.finalCandidateId,
    },
  );
  return {
    resolved: true,
    status: res.data.status ?? "",
    finalCandidateId: params.finalCandidateId,
  };
}
