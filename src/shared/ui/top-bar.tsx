"use client";

import { ChevronLeft } from "lucide-react";

interface Props {
  onBack: () => void;
}

export function TopBar({ onBack }: Props) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center bg-background/80 px-2 backdrop-blur-md">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로 가기"
        className="flex h-11 w-11 items-center justify-center rounded-full text-foreground/80 transition-all duration-150 hover:bg-primary/5 hover:text-foreground active:scale-95 active:bg-primary/10"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
      </button>
    </header>
  );
}
