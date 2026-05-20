import { RestaurantRecommendationView } from "@/views/restaurant-recommendation/ui/RestaurantRecommendationView";

interface PageProps {
  params: { code: string };
}

export default function Page({ params }: PageProps) {
  return <RestaurantRecommendationView code={decodeURIComponent(params.code)} />;
}
