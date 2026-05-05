import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Header } from "@/widgets/header";

export function HomeView() {
  return (
    <main className="flex flex-1 flex-col">
      <Header />
      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            모여에 오신 것을 환영합니다
          </h1>
          <p className="text-sm text-muted-foreground">
            친구들과 모일 중간 장소와 식당을 함께 정해보세요.
          </p>
        </div>
        <Button asChild className="rounded-full px-6">
          <Link href="/rooms/new">
            <Sparkles className="mr-1.5 h-4 w-4" />
            모임 만들기
          </Link>
        </Button>
      </section>
    </main>
  );
}
