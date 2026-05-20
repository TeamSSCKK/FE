import { RestaurantRecommendationView } from "@/views/restaurant-recommendation/ui/RestaurantRecommendationView";

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <RestaurantRecommendationView code={code} />;
}
