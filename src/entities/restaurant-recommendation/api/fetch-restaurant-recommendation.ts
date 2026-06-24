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

export interface BackendResult {
  place?: { id: string; name: string; lat: number; lng: number };
  restaurants: BackendRestaurant[];
}

/**
 * 백엔드 식당 응답(recommend-restaurants / restaurant-candidates 라우트 공통 형태)을
 * 화면용 모델로 변환한다. 생성·읽기 전용 두 경로가 동일 매핑을 공유한다.
 */
export function mapBackendResult(
  data: BackendResult,
): RestaurantRecommendationResult {
  const { place, restaurants } = data;

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

export async function fetchRestaurantRecommendation(
  code: string,
  placeCandidateIdArg?: string,
): Promise<RestaurantRecommendationResult> {
  // 확정 장소 id는 백엔드(final_decision) 값을 우선, 없으면 localStorage 폴백.
  const placeCandidateId =
    placeCandidateIdArg ||
    (typeof window !== "undefined"
      ? (localStorage.getItem(`moyeo_place_${code}`) ?? "")
      : "");

  const response = await apiClient.post<BackendResult>(
    "/functions/v1/recommend-restaurants",
    {
      inviteCode: code,
      placeCandidateId: placeCandidateId ? Number(placeCandidateId) : undefined,
      limit: 5,
    },
  );

  return mapBackendResult(response.data);
}
