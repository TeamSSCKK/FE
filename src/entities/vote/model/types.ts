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
}
