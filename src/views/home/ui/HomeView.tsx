import { Header } from "@/widgets/header";

export function HomeView() {
  return (
    <main className="flex flex-1 flex-col">
      <Header />
      <section className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          모여에 오신 것을 환영합니다
        </h1>
        <p className="text-sm text-muted-foreground">
          친구들과 모일 중간 장소와 식당을 함께 정해보세요.
        </p>
      </section>
    </main>
  );
}
