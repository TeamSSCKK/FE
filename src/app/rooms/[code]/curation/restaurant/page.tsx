import { RestaurantRecommendationView } from "@/views/restaurant-recommendation/ui/RestaurantRecommendationView";

interface PageProps {
  params: { code: string };
}

// 호스트 큐레이션 경로 — 여기서만 식당 추천을 생성한다.
export default function Page({ params }: PageProps) {
  return (
    <RestaurantRecommendationView
      code={decodeURIComponent(params.code)}
      mode="generate"
    />
  );
}
