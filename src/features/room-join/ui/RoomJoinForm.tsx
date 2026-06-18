"use client";

import { FormEvent } from "react";
import { Users } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useRoomJoinStore } from "../model/store";
import { ClearButton } from "@/shared/ui/clear-button";

interface Props {
  roomCode: string;
  onSuccess: (memberId: string) => void;
}

export function RoomJoinForm({ roomCode, onSuccess }: Props) {
  const name = useRoomJoinStore((s) => s.name);
  const isSubmitting = useRoomJoinStore((s) => s.isSubmitting);
  const error = useRoomJoinStore((s) => s.error);

  const setName = useRoomJoinStore((s) => s.setName);
  const setError = useRoomJoinStore((s) => s.setError);
  const submit = useRoomJoinStore((s) => s.submit);
  const reset = useRoomJoinStore((s) => s.reset);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("참가자 이름을 입력해주세요.");
      return;
    }

    const result = await submit(roomCode);
    if (result) {
      reset();
      onSuccess(result.memberId);
    }
  };

  return (
    <div className="animate-fade-up rounded-2xl bg-primary/[0.06] p-4">
      <div className="mb-5 flex items-center gap-2">
        <Users className="h-5 w-5 text-gray-700" />
        <p className="text-[15px] font-semibold text-gray-900">
          참가자 이름을 입력해주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              disabled={isSubmitting}
              className="h-12 w-full rounded-2xl bg-background px-4 text-sm text-gray-900 outline-none ring-1 ring-input transition focus-visible:ring-2 focus-visible:ring-primary/40"
              maxLength={20}
            />
            {name && (
              <ClearButton onClick={() => setName("")} className="right-3" />
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="h-12 rounded-2xl bg-primary px-5 text-sm font-semibold text-white active:scale-[0.97] active:opacity-95 disabled:opacity-60"
          >
            {isSubmitting ? "참가 중..." : "참가하기"}
          </Button>
        </div>

        {error && <p className="mt-2 text-[12px] text-destructive">{error}</p>}
      </form>
    </div>
  );
}
