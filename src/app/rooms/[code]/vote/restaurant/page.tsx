import { RestaurantRecommendationView } from "@/views/restaurant-recommendation/ui/RestaurantRecommendationView";

interface PageProps {
  params: { code: string };
}

// 멤버·호스트 공용 식당 투표 경로 (호스트 가드 없음 — 뷰가 useRoomRole로 역할만 판별).
// vote 모드: 저장된 후보만 읽고 추천을 재생성하지 않는다(투표 유실 방지).
export default function Page({ params }: PageProps) {
  return (
    <RestaurantRecommendationView
      code={decodeURIComponent(params.code)}
      mode="vote"
    />
  );
}
