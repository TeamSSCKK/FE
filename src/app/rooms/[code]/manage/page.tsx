import { RoomManageView } from "@/views/room-manage";

interface PageProps {
  params: { code: string };
}

export default function Page({ params }: PageProps) {
  return <RoomManageView roomCode={decodeURIComponent(params.code)} />;
}
