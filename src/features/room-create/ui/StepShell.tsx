"use client";

import { ReactNode } from "react";
import { TopBar } from "@/shared/ui/top-bar";
import { cn } from "@/shared/lib/utils";

interface Props {
  onBack?: () => void;
  currentStep?: 1 | 2 | 3;
  aboveContent?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}

export function StepShell({
  onBack,
  currentStep,
  aboveContent,
  children,
  footer,
}: Props) {
  return (
    <div className="flex flex-1 flex-col">
      {onBack ? <TopBar onBack={onBack} /> : <div className="h-14" />}

      {currentStep ? (
        <div className="flex items-center gap-1.5 px-5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-[3px] flex-1 rounded-full transition-colors duration-500",
                s <= currentStep ? "bg-primary" : "bg-primary/10",
              )}
            />
          ))}
        </div>
      ) : null}

      <header className="mt-7 mb-10 px-5">
        <h1 className="animate-fade-up text-[26px] font-bold leading-snug tracking-tight">
          모임 약속 장소,
          <br />
          이제 손쉽게 해결해보세요.
        </h1>
        <p
          className="mt-2 animate-fade-up text-[13px] text-muted-foreground"
          style={{ animationDelay: "80ms" }}
        >
          이제는 모임 의사결정도 맡기는 시대
        </p>
      </header>

      <div
        className="flex-1 animate-fade-up px-5"
        style={{ animationDelay: "160ms" }}
      >
        {aboveContent ? (
          <p className="mb-3 text-sm font-medium text-foreground/70">
            {aboveContent}
          </p>
        ) : null}
        <div className="space-y-5">{children}</div>
      </div>

      <div
        className="sticky bottom-0 animate-fade-up bg-background px-5 pb-6 pt-3"
        style={{ animationDelay: "240ms" }}
      >
        {footer}
      </div>
    </div>
  );
}
