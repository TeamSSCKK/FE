import { create } from "zustand";
import type { PreferenceTone } from "@/entities/room";

export type ChipState = "neutral" | "like" | "dislike";

interface PreferenceInputState {
  tagStates: Record<string, ChipState>;
  restrictionStates: Record<string, boolean>;
  isSubmitting: boolean;
  error: string | null;

  setTagState: (id: string, state: ChipState) => void;
  cycleTagState: (id: string) => void;
  toggleRestriction: (id: string) => void;
  setSubmitting: (v: boolean) => void;
  setError: (msg: string | null) => void;
  hydrateFromMember: (
    tags: Array<{ id: string; tone: PreferenceTone }>,
    restrictions: Array<{ id: string }>,
  ) => void;
  reset: () => void;
}

export const usePreferenceInputStore = create<PreferenceInputState>((set) => ({
  tagStates: {},
  restrictionStates: {},
  isSubmitting: false,
  error: null,
  setTagState: (id, state) =>
    set((s) => ({ tagStates: { ...s.tagStates, [id]: state } })),
  cycleTagState: (id) =>
    set((s) => {
      const cur = s.tagStates[id] ?? "neutral";
      const next: ChipState =
        cur === "neutral" ? "like" : cur === "like" ? "dislike" : "neutral";
      return { tagStates: { ...s.tagStates, [id]: next } };
    }),
  toggleRestriction: (id) =>
    set((s) => ({
      restrictionStates: {
        ...s.restrictionStates,
        [id]: !s.restrictionStates[id],
      },
    })),
  setSubmitting: (v) => set({ isSubmitting: v }),
  setError: (msg) => set({ error: msg }),
  hydrateFromMember: (tags, restrictions) => {
    const tagStates: Record<string, ChipState> = {};
    tags.forEach((t) => {
      tagStates[t.id] = t.tone;
    });
    const restrictionStates: Record<string, boolean> = {};
    restrictions.forEach((r) => {
      restrictionStates[r.id] = true;
    });
    set({ tagStates, restrictionStates, error: null });
  },
  reset: () =>
    set({
      tagStates: {},
      restrictionStates: {},
      isSubmitting: false,
      error: null,
    }),
}));
