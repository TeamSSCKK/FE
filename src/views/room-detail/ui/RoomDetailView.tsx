import { RoomStatusWidget } from "@/widgets/room-status";

interface Props {
  roomCode: string;
}

export function RoomDetailView({ roomCode }: Props) {
  return (
    <main className="flex flex-1 flex-col">
      <RoomStatusWidget roomCode={roomCode} currentMemberId={undefined} />
    </main>
  );
}
