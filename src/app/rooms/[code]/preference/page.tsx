import { RoomPreferenceView } from "@/views/room-preference/ui/RoomPreferenceView";

interface PageProps {
  params: { code: string };
}

export default function PreferencePage({ params }: PageProps) {
  return <RoomPreferenceView code={decodeURIComponent(params.code)} />;
}
