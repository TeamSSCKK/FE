"use client";

import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface Props {
  aboveCard?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  footerAlign?: "center" | "right";
}

export function StepShell({
  aboveCard,
  children,
  footer,
  footerAlign = "right",
}: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-10">
        <h1 className="text-3xl font-bold leading-tight">
          모임 약속 장소,
          <br />
          이제 손쉽게 해결해보세요.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          이제는 모임 의사결정도 맡기는 시대
        </p>
      </header>

      {aboveCard ? (
        <div className="mb-3 px-1 text-base font-semibold">{aboveCard}</div>
      ) : null}

      <div className="rounded-2xl bg-muted/60 p-5">
        <div className="space-y-4">{children}</div>
        <div
          className={cn(
            "mt-6 flex",
            footerAlign === "center" ? "justify-center" : "justify-end",
          )}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}
