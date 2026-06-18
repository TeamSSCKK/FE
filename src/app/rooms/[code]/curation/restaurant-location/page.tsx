import { CurationMeetingLocationView } from "@/views/curation-meeting-location/ui/CurationMeetingLocationView";

interface PageProps {
  params: { code: string };
}

export default function Page({ params }: PageProps) {
  return (
    <CurationMeetingLocationView code={decodeURIComponent(params.code)} />
  );
}
