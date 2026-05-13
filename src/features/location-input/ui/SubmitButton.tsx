"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useLocationInputStore } from "../model/store";

interface Props {
  onSubmit: () => void;
}

export function SubmitButton({ onSubmit }: Props) {
  const selected = useLocationInputStore((s) => s.selected);
  const isSubmitting = useLocationInputStore((s) => s.isSubmitting);
  const disabled = !selected || isSubmitting;

  return (
    <Button
      type="button"
      onClick={onSubmit}
      disabled={disabled}
      className="h-14 w-full rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] active:opacity-95"
    >
      {isSubmitting ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      ) : (
        "이 위치로 입력 완료"
      )}
    </Button>
  );
}
