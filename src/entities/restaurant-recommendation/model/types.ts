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
  address?: string;
  lat?: number;
  lng?: number;
  rank?: number;
}

export interface ConfirmedPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface RestaurantRecommendationResult {
  place?: ConfirmedPlace;
  restaurants: RecommendedRestaurant[];
}
