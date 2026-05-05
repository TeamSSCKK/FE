import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

export function HomeView() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/2 h-64 w-64 rounded-full bg-primary/[0.06] blur-3xl"
      />

      <div className="relative flex flex-1 flex-col px-5">
        <div className="mt-20">
          <h1 className="animate-fade-up text-[30px] font-bold leading-tight tracking-tight">
            친구들과의 모임,
            <br />
            <span className="text-primary">모여</span>에서 시작하세요
          </h1>
          <p
            className="mt-4 max-w-[260px] animate-fade-up text-[14px] leading-relaxed text-muted-foreground"
            style={{ animationDelay: "120ms" }}
          >
            중간 장소와 식당을 함께,
            <br />
            손쉽게 정해보세요.
          </p>
        </div>

        <div
          className="flex flex-1 animate-fade-up items-start justify-center pt-16"
          style={{ animationDelay: "200ms" }}
        >
          <Image
            src="/resource/main-people.png"
            alt="친구들과 함께하는 모임"
            width={2816}
            height={1536}
            priority
            className="h-auto w-full max-w-[352px]"
          />
        </div>
      </div>

      <div className="sticky bottom-0 z-10 animate-fade-up bg-background/85 px-5 pb-6 pt-4 backdrop-blur-md">
        <Button
          asChild
          className="h-14 w-full rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] active:opacity-95"
        >
          <Link href="/rooms/new">모임 만들기</Link>
        </Button>
      </div>
    </main>
  );
}
