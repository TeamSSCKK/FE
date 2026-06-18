import { apiClient } from "@/shared/api/axios-instance";

export type VoteType = "PLACE" | "RESTAURANT";

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

export async function closeVote(params: {
  meetingId: string;
  finalCandidateId: string;
  voteType: VoteType;
}): Promise<{ status: string }> {
  const res = await apiClient.post<{ message: string; status: string }>(
    "/functions/v1/close-vote",
    {
      meetingId: params.meetingId,
      finalCandidateId: params.finalCandidateId,
      voteType: params.voteType,
    },
  );
  return { status: res.data.status };
}
