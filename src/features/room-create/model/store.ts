import { create } from "zustand";
import { createRoom, addJoinedCode } from "@/entities/room";

export type WizardStep = 1 | 2 | 3 | 4;

interface RoomCreateState {
  step: WizardStep;
  name: string;
  dateTime: string;
  hostName: string;
  password: string;
  roomCode: string | null;
  isSubmitting: boolean;

  setName: (v: string) => void;
  setDateTime: (v: string) => void;
  setHostName: (v: string) => void;
  setPassword: (v: string) => void;

  goToStep: (s: WizardStep) => void;
  next: () => void;
  prev: () => void;

  submit: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  step: 1 as WizardStep,
  name: "",
  dateTime: "",
  hostName: "",
  password: "",
  roomCode: null,
  isSubmitting: false,
};

export const useRoomCreateStore = create<RoomCreateState>((set, get) => ({
  ...initialState,

  setName: (v) => set({ name: v }),
  setDateTime: (v) => set({ dateTime: v }),
  setHostName: (v) => set({ hostName: v }),
  setPassword: (v) => set({ password: v }),

  goToStep: (s) => set({ step: s }),
  next: () =>
    set((state) => ({
      step: Math.min(4, state.step + 1) as WizardStep,
    })),
  prev: () =>
    set((state) => ({
      step: Math.max(1, state.step - 1) as WizardStep,
    })),

  submit: async () => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true });
    try {
      const { name, dateTime, hostName, password } = get();
      const result = await createRoom({ name, dateTime, hostName, password });
      addJoinedCode(result.code);
      set({ roomCode: result.code, step: 4, isSubmitting: false });
    } catch (e) {
      console.error("createRoom failed", e);
      set({ isSubmitting: false });
    }
  },

  reset: () => set({ ...initialState }),
}));
