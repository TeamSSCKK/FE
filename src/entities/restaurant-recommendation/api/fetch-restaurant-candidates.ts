import {
  mapBackendResult,
  type BackendResult,
} from "./fetch-restaurant-recommendation";
import type { RestaurantRecommendationResult } from "../model/types";

/**
 * 저장된 식당 후보를 읽기 전용으로 가져온다(추천 생성 트리거 없음).
 * 투표 화면 전용. 생성은 호스트 큐레이션 경로(fetchRestaurantRecommendation)에서만 한다.
 */
export async function fetchRestaurantCandidates(
  code: string,
  placeCandidateId: string,
): Promise<RestaurantRecommendationResult> {
  const res = await fetch(
    `/api/rooms/${encodeURIComponent(code)}/restaurant-candidates?placeId=${encodeURIComponent(placeCandidateId)}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "식당 후보 조회 실패" }))) as {
      error: string;
    };
    throw new Error(err.error);
  }
  return mapBackendResult((await res.json()) as BackendResult);
}
