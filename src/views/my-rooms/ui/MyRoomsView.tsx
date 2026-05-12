export function MyRoomsView() {
  return (
    <main className="relative flex flex-1 flex-col px-5">
      <div className="mt-16">
        <h1 className="animate-fade-up text-[28px] font-bold leading-tight tracking-tight">
          내 모임
        </h1>
        <p
          className="mt-3 animate-fade-up text-[14px] leading-relaxed text-muted-foreground"
          style={{ animationDelay: "120ms" }}
        >
          참여 중인 모임을 모아볼 수 있어요.
        </p>
      </div>

      <div
        className="flex flex-1 animate-fade-up items-center justify-center"
        style={{ animationDelay: "200ms" }}
      >
        <p className="text-[14px] text-muted-foreground">
          아직 참여 중인 모임이 없어요.
        </p>
      </div>
    </main>
  );
}
