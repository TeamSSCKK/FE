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

export async function fetchPlaceRecommendation(
  code: string,
): Promise<PlaceRecommendationResult> {
  const response = await apiClient.post<RecommendPlacesResponse>(
    "/functions/v1/recommend-places",
    { inviteCode: code },
  );

  const { calculationMethod, places, origins } = response.data;

  const mappedPlaces: RecommendedPlace[] = places.map((p) => ({
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

  const mappedOrigins: MemberOrigin[] = origins.map((o) => ({
    memberId: o.memberId,
    memberName: o.memberName,
    lat: o.lat,
    lng: o.lng,
  }));

  return { places: mappedPlaces, origins: mappedOrigins, calculationMethod };
}
