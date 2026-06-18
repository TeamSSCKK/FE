import { create } from "zustand";
import { castVote } from "../api/cast-vote";
import { loadSessionData } from "@/shared/lib/room-session";

interface VoteActionState {
  selectedCandidateId: string | null;
  isSubmitting: boolean;
  hasVoted: boolean;
  error: string | null;

  select: (candidateId: string) => void;
  submit: (roomCode: string) => Promise<void>;
  reset: () => void;
}

export const useVoteActionStore = create<VoteActionState>((set, get) => ({
  selectedCandidateId: null,
  isSubmitting: false,
  hasVoted: false,
  error: null,

  select: (candidateId) => set({ selectedCandidateId: candidateId }),

  submit: async (roomCode: string) => {
    const { selectedCandidateId, isSubmitting } = get();
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
        voteType: "PLACE",
      });
      set({ hasVoted: true, isSubmitting: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "투표에 실패했어요.";
      set({ isSubmitting: false, error: msg });
    }
  },

  reset: () =>
    set({
      selectedCandidateId: null,
      isSubmitting: false,
      hasVoted: false,
      error: null,
    }),
}));
