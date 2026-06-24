import { RestaurantRecommendationView } from "@/views/restaurant-recommendation/ui/RestaurantRecommendationView";

interface PageProps {
  params: { code: string };
}

// 멤버·호스트 공용 식당 투표 경로 (호스트 가드 없음 — 뷰가 useRoomRole로 역할만 판별).
export default function Page({ params }: PageProps) {
  return <RestaurantRecommendationView code={decodeURIComponent(params.code)} />;
}
