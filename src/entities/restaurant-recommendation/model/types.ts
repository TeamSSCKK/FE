export interface RestaurantPhoto {
  id: string;
  url: string;
}

export interface RecommendedRestaurant {
  id: string;
  name: string;
  travelTimeMinutes: number;
  fitScore: number;
  naverMapUrl: string;
  kakaoMapUrl: string;
  tags: string[];
  representativeMenu: string[];
  photos: RestaurantPhoto[];
}

export interface RestaurantRecommendationResult {
  restaurants: RecommendedRestaurant[];
}
