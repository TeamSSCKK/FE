import type { CandidateTally } from "../model/types";

export interface DerivedWinner {
  leadingCandidateId: string | null;
  isTie: boolean;
  tiedCandidateIds: string[];
  maxCount: number;
}

/**
 * 집계(tally)에서 선두/동률을 도출하는 순수 함수.
 * 백엔드 voting.ts(determineWinner)와 동일 규칙: 단독 최다 → leading, 공동 최다 → tie.
 */
export function deriveWinner(tally: CandidateTally[]): DerivedWinner {
  if (tally.length === 0) {
    return { leadingCandidateId: null, isTie: false, tiedCandidateIds: [], maxCount: 0 };
  }
  const maxCount = Math.max(...tally.map((entry) => entry.count));
  const top = tally.filter((entry) => entry.count === maxCount).map((entry) => entry.candidateId);
  if (top.length === 1) {
    return { leadingCandidateId: top[0], isTie: false, tiedCandidateIds: top, maxCount };
  }
  return { leadingCandidateId: null, isTie: true, tiedCandidateIds: top, maxCount };
}
