import axios from "axios";
import { apiClient } from "@/shared/api/axios-instance";
import type {
  PlaceRecommendationResult,
  RecommendedPlace,
  MemberOrigin,
  MemberTravel,
} from "../model/types";

interface BackendPlace {
  id: string;
  name: string;
  category: string;
  address?: string;
  lat: number;
  lng: number;
  rank?: number;
  averageMinutes: number;
  maxMinutes?: number;
  standardDeviation?: number;
  fairnessScore?: number;
  memberTravels: MemberTravel[];
}

interface BackendOrigin {
  memberId: string;
  memberName: string;
  lat: number;
  lng: number;
}

interface RecommendPlacesResponse {
  calculationMethod: string;
  places: BackendPlace[];
  origins: BackendOrigin[];
}

function mapToResult(data: RecommendPlacesResponse): PlaceRecommendationResult {
  const mappedPlaces: RecommendedPlace[] = data.places.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category ?? "",
    address: p.address,
    lat: p.lat,
    lng: p.lng,
    memberTravels: p.memberTravels ?? [],
    averageMinutes: p.averageMinutes,
    maxMinutes: p.maxMinutes,
    standardDeviation: p.standardDeviation,
    fairnessScore: p.fairnessScore,
    rank: p.rank,
  }));

  const mappedOrigins: MemberOrigin[] = data.origins.map((o) => ({
    memberId: o.memberId,
    memberName: o.memberName,
    lat: o.lat,
    lng: o.lng,
  }));

  return {
    places: mappedPlaces,
    origins: mappedOrigins,
    calculationMethod: data.calculationMethod,
  };
}

export async function fetchPlaceRecommendation(
  code: string,
): Promise<PlaceRecommendationResult> {
  try {
    const response = await apiClient.post<RecommendPlacesResponse>(
      "/functions/v1/recommend-places",
      { inviteCode: code },
    );
    return mapToResult(response.data);
  } catch (e) {
    // 추천을 한 번 받으면 모임 상태가 PLACE_VOTING으로 바뀌어, 재진입 시
    // recommend-places가 409를 반환한다. 이미 저장된 추천 결과(place_candidate)를
    // 조회해 그대로 보여준다. (위치 미입력 등 결과가 없는 409는 그대로 throw)
    if (axios.isAxiosError(e) && e.response?.status === 409) {
      const res = await fetch(
        `/api/rooms/${encodeURIComponent(code)}/candidates`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const data = (await res.json()) as RecommendPlacesResponse;
        if (data.places?.length) return mapToResult(data);
      }
    }
    throw e;
  }
}
