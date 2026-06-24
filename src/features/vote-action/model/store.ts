import { create } from "zustand";
import { castVote } from "../api/cast-vote";
import type { VoteType } from "@/entities/vote";
import { loadSessionData } from "@/shared/lib/room-session";

interface VoteActionState {
  voteType: VoteType;
  selectedCandidateId: string | null;
  /** 서버에 제출된(반영된) 내 투표 — 변경 투표 구분용 */
  submittedCandidateId: string | null;
  isSubmitting: boolean;
  error: string | null;

  init: (voteType: VoteType) => void;
  select: (candidateId: string) => void;
  submit: (roomCode: string) => Promise<void>;
  /** 서버에서 복원한 내 투표를 반영한다(재방문/타기기 투표 하이라이트 복원용). */
  setSubmitted: (candidateId: string | null) => void;
  reset: () => void;
}

export const useVoteActionStore = create<VoteActionState>((set, get) => ({
  voteType: "PLACE",
  selectedCandidateId: null,
  submittedCandidateId: null,
  isSubmitting: false,
  error: null,

  init: (voteType) =>
    set({ voteType, selectedCandidateId: null, submittedCandidateId: null, error: null }),

  select: (candidateId) => set({ selectedCandidateId: candidateId }),

  setSubmitted: (candidateId) => set({ submittedCandidateId: candidateId }),

  submit: async (roomCode: string) => {
    const { selectedCandidateId, isSubmitting, voteType } = get();
    if (!selectedCandidateId || isSubmitting) return;

    const session = loadSessionData(roomCode);
    if (!session) {
      set({ error: "세션 정보가 없습니다. 다시 참여해주세요." });
      return;
    }

    set({ isSubmitting: true, error: null });
    try {
      await castVote({
        meetingId: session.meetingId,
        participantId: session.participantId,
        candidateId: selectedCandidateId,
        voteType,
      });
      set({ submittedCandidateId: selectedCandidateId, isSubmitting: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "투표에 실패했어요.";
      set({ isSubmitting: false, error: msg });
    }
  },

  reset: () =>
    set({
      selectedCandidateId: null,
      submittedCandidateId: null,
      isSubmitting: false,
      error: null,
    }),
}));
