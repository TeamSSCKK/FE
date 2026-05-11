import { RoomDetailView } from "@/views/room-detail";

interface PageProps {
  params: {
    code: string;
  };
}

export default function Page({ params }: PageProps) {
  return <RoomDetailView roomCode={decodeURIComponent(params.code)} />;
}
