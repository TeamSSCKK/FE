import type { PlaceRecommendationResult } from "../model/types";

// TODO: apiClient 교체
// 실제 백엔드는 멤버들의 출발지를 기반으로 중간지점 장소를 산출한다.
// 지금은 mock — 일정 시간 대기 후 빈 결과를 반환한다.
const MOCK_DELAY = 2500;

// 개발 중 에러 화면 확인용 — true로 바꾸면 추천 실패를 시뮬레이션한다.
const MOCK_FORCE_ERROR = false;

/**
 * 장소 추천을 요청한다.
 * @throws 추천 도출에 실패하면 Error — 호출부에서 사용자용 메시지로 변환해 표시한다.
 */
export async function fetchPlaceRecommendation(
  code: string,
): Promise<PlaceRecommendationResult> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY));

  if (MOCK_FORCE_ERROR) {
    throw new Error("추천 장소 도출 실패");
  }

  // 방 존재 여부 확인
  if (!localStorage.getItem(`room-${code}`)) {
    throw new Error("Room not found");
  }

  return { places: [] };
}
