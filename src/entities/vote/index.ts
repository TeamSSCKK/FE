export type { VoteType, CandidateTally, VoteResults } from "./model/types";
export { fetchVoteResults } from "./api/fetch-vote-results";
export { deriveWinner } from "./lib/derive-winner";
export type { DerivedWinner } from "./lib/derive-winner";
