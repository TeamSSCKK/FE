export { castVote, closeVote } from "./api/cast-vote";
export type { CloseVoteResult } from "./api/cast-vote";
export { decidePlace } from "./api/decide-place";
export { useVoteActionStore } from "./model/store";
export { VoteCandidateButton } from "./ui/VoteCandidateButton";
// VoteType의 정본은 entities/vote. 기존 소비처 호환을 위해 재노출한다.
export type { VoteType } from "@/entities/vote";
