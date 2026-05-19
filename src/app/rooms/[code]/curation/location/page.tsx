import { PlaceRecommendationView } from "@/views/place-recommendation";

interface PageProps {
  params: { code: string };
}

export default function Page({ params }: PageProps) {
  return <PlaceRecommendationView roomCode={decodeURIComponent(params.code)} />;
}
