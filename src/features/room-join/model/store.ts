import { create } from "zustand";
import { joinRoom, addJoinedCode } from "@/entities/room";
import type { Member } from "@/entities/room";

interface RoomJoinState {
  name: string;
  isSubmitting: boolean;
  error: string | null;

  setName: (v: string) => void;
  setError: (v: string | null) => void;

  submit: (roomCode: string) => Promise<{ memberId: string; member: Member } | null>;
  reset: () => void;
}

const initialState = {
  name: "",
  isSubmitting: false,
  error: null,
};

export const useRoomJoinStore = create<RoomJoinState>((set, get) => ({
  ...initialState,

  setName: (v) => set({ name: v }),
  setError: (v) => set({ error: v }),

  submit: async (roomCode: string) => {
    if (get().isSubmitting) return null;
    set({ isSubmitting: true, error: null });
    try {
      const { name } = get();
      const result = await joinRoom({ code: roomCode, name });
      addJoinedCode(roomCode);
      set({ isSubmitting: false });
      return result;
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "참여에 실패했습니다";
      set({ isSubmitting: false, error: errorMessage });
      return null;
    }
  },

  reset: () => set({ ...initialState }),
}));
