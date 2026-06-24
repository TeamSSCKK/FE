export type VoteType = "PLACE" | "RESTAURANT";

export interface CandidateTally {
  candidateId: string;
  count: number;
}

/** 백엔드 get-vote-results 응답. 모든 후보 id는 문자열이다. */
export interface VoteResults {
  voteType: VoteType;
  tally: CandidateTally[];
  winnerId: string | null;
  isTie: boolean;
  topCandidates: string[];
  finalized: boolean;
  finalCandidateId: string | null;
  /** 요청에 participantId가 있을 때, 그 참가자가 현재 투표한 후보 id(없으면 null). */
  myCandidateId: string | null;
}
