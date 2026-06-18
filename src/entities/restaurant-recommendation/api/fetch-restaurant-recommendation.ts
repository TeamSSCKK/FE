import { apiClient } from "@/shared/api/axios-instance";
import type {
  RestaurantRecommendationResult,
  RecommendedRestaurant,
} from "../model/types";

interface BackendRestaurant {
  id: string;
  name: string;
  category?: string;
  address?: string;
  lat?: number;
  lng?: number;
  distanceMeters?: number;
  preferenceScore?: number;
  rank?: number;
  matchedLikes?: string[];
  sourceUrl?: string;
}

interface BackendResult {
  place?: { id: string; name: string; lat: number; lng: number };
  restaurants: BackendRestaurant[];
}

export async function fetchRestaurantRecommendation(
  code: string,
): Promise<RestaurantRecommendationResult> {
  const placeCandidateId =
    typeof window !== "undefined"
      ? (localStorage.getItem(`moyeo_place_${code}`) ?? "")
      : "";

  const response = await apiClient.post<BackendResult>(
    "/functions/v1/recommend-restaurants",
    {
      inviteCode: code,
      placeCandidateId: placeCandidateId ? Number(placeCandidateId) : undefined,
      limit: 5,
    },
  );

  const { place, restaurants } = response.data;

  const mapped: RecommendedRestaurant[] = restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    // distanceMeters만 오므로 도보 분속(~78m/분)으로 근사 환산한다.
    travelTimeMinutes: r.distanceMeters ? Math.round(r.distanceMeters / 78) : 0,
    // preferenceScore는 이미 0~100 적합도 점수다. *100 하지 않고 0~100으로 clamp.
    fitScore:
      r.preferenceScore != null
        ? Math.min(100, Math.max(0, Math.round(r.preferenceScore)))
        : 0,
    naverMapUrl: r.sourceUrl ?? "",
    kakaoMapUrl: "",
    tags: r.matchedLikes ?? [],
    representativeMenu: [],
    photos: [],
    address: r.address,
    lat: r.lat,
    lng: r.lng,
    rank: r.rank,
  }));

  return { place, restaurants: mapped };
}
