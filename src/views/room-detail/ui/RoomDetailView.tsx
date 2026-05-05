interface Props {
  code: string;
}

export function RoomDetailView({ code }: Props) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold">모임 {code}</h1>
      <p className="text-sm text-muted-foreground">
        이 페이지는 아직 준비 중입니다.
      </p>
    </main>
  );
}
