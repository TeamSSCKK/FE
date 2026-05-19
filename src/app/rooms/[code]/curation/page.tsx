import { RoomCurationView } from "@/views/room-curation";

interface PageProps {
  params: { code: string };
}

export default function Page({ params }: PageProps) {
  return <RoomCurationView roomCode={decodeURIComponent(params.code)} />;
}
