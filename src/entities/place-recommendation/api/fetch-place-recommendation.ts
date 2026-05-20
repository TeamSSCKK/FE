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

  return {
    places: [
      {
        id: "pl1",
        name: "용산역 4호선",
        address: "서울 용산구 한강대로23길 55",
        lat: 37.529,
        lng: 126.965,
        averageTravelTimeMinutes: 20,
        fitScore: 97,
        travelTimesByMember: [
          { memberId: "m1", memberName: "준호", minutes: 18 },
          { memberId: "m2", memberName: "지원", minutes: 20 },
          { memberId: "m3", memberName: "신주미", minutes: 22 },
        ],
      },
      {
        id: "pl2",
        name: "서울역 1호선",
        address: "서울 용산구 한강대로 405",
        lat: 37.555,
        lng: 126.972,
        averageTravelTimeMinutes: 25,
        fitScore: 89,
        travelTimesByMember: [
          { memberId: "m1", memberName: "준호", minutes: 23 },
          { memberId: "m2", memberName: "지원", minutes: 25 },
          { memberId: "m3", memberName: "신주미", minutes: 27 },
        ],
      },
      {
        id: "pl3",
        name: "이태원역 6호선",
        address: "서울 용산구 이태원로 177",
        lat: 37.534,
        lng: 126.994,
        averageTravelTimeMinutes: 22,
        fitScore: 85,
        travelTimesByMember: [
          { memberId: "m1", memberName: "준호", minutes: 20 },
          { memberId: "m2", memberName: "지원", minutes: 24 },
          { memberId: "m3", memberName: "신주미", minutes: 22 },
        ],
      },
    ],
  };
}
