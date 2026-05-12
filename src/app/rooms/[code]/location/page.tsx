import { RoomLocationView } from "@/views/room-location";

interface PageProps {
  params: { code: string };
}

export default function Page({ params }: PageProps) {
  return <RoomLocationView roomCode={decodeURIComponent(params.code)} />;
}
