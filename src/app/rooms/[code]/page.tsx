import { RoomDetailView } from "@/views/room-detail";

interface Props {
  params: { code: string };
}

export default function Page({ params }: Props) {
  return <RoomDetailView code={decodeURIComponent(params.code)} />;
}
