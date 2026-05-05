"use client";

import { useRouter } from "next/navigation";
import { TopBar } from "@/shared/ui/top-bar";

interface Props {
  code: string;
}

export function RoomDetailView({ code }: Props) {
  const router = useRouter();
  return (
    <main className="flex flex-1 flex-col">
      <TopBar onBack={() => router.back()} />
      <section className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
        <p className="animate-fade-up font-mono text-xs font-medium tracking-[0.15em] text-primary">
          {code}
        </p>
        <h1
          className="animate-fade-up text-[22px] font-bold leading-snug tracking-tight"
          style={{ animationDelay: "100ms" }}
        >
          모임 페이지를 준비 중이에요
        </h1>
        <p
          className="max-w-[240px] animate-fade-up text-[13px] leading-relaxed text-muted-foreground"
          style={{ animationDelay: "180ms" }}
        >
          곧 멋진 모습으로 찾아올게요.
        </p>
      </section>
    </main>
  );
}
