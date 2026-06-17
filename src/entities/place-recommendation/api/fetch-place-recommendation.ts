import { apiClient } from "@/shared/api/axios-instance";
import type { PlaceRecommendationResult } from "../model/types";

interface PlaceRecommendationRequest {
  inviteCode: string;
  limit: number;
}

/**
 * 장소 추천을 요청한다.
 * @throws 추천 도출에 실패하면 Error — 호출부에서 사용자용 메시지로 변환해 표시한다.
 */
export async function fetchPlaceRecommendation(
  code: string,
): Promise<PlaceRecommendationResult> {
  const request: PlaceRecommendationRequest = {
    inviteCode: code,
    limit: 5,
  };

  const { data } = await apiClient.post<PlaceRecommendationResult>(
    "/recommend-places",
    request,
  );
  return data;
}
