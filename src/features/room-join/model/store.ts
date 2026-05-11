import { create } from "zustand";
import { joinRoom, Member } from "@/entities/room"; // ✅ Member 임포트

interface RoomJoinState {
  name: string;
  password: string;
  isSubmitting: boolean;
  error: string | null;

  setName: (v: string) => void;
  setPassword: (v: string) => void;
  setError: (v: string | null) => void;

  submit: (roomCode: string) => Promise<{ memberId: string; member: Member } | null>; // ✅ any를 Member로 변경
  reset: () => void;
}

// ... 나머지 코드는 기존과 동일 ...

/*import { create } from "zustand";
import { joinRoom } from "@/entities/room";

interface RoomJoinState {
  name: string;
  password: string;
  isSubmitting: boolean;
  error: string | null;

  setName: (v: string) => void;
  setPassword: (v: string) => void;
  setError: (v: string | null) => void;

  submit: (roomCode: string) => Promise<{ memberId: string; member: any } | null>;
  reset: () => void;
}
*/
const initialState = {
  name: "",
  password: "",
  isSubmitting: false,
  error: null,
};

export const useRoomJoinStore = create<RoomJoinState>((set, get) => ({
  ...initialState,

  setName: (v) => set({ name: v }),
  setPassword: (v) => set({ password: v }),
  setError: (v) => set({ error: v }),

  submit: async (roomCode: string) => {
    if (get().isSubmitting) return null;
    set({ isSubmitting: true, error: null });
    try {
      const { name, password } = get();
      const result = await joinRoom({ code: roomCode, name, password });
      set({ isSubmitting: false });
      return result;
    } catch (e: any) {
      const errorMessage = e.message || "참여에 실패했습니다";
      set({ isSubmitting: false, error: errorMessage });
      return null;
    }
  },

  reset: () => set({ ...initialState }),
}));
