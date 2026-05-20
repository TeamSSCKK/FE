import type { RestaurantRecommendationResult } from "../model/types";

// TODO: apiClient 교체
// 실제 백엔드는 모임 위치/멤버 취향을 종합해 식당 후보를 산출한다.
// 지금은 mock — 일정 시간 대기 후 고정된 3개 결과를 반환한다.
const MOCK_DELAY = 2500;

export async function fetchRestaurantRecommendation(
  code: string,
): Promise<RestaurantRecommendationResult> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY));

  // 방 존재 여부 확인 — 직접 URL 진입으로 인한 잘못된 호출을 막는다.
  if (typeof window !== "undefined" && !localStorage.getItem(`room-${code}`)) {
    throw new Error("Room not found");
  }

  return {
    restaurants: [
      {
        id: "r1",
        name: "김밥천국 용산점",
        travelTimeMinutes: 20,
        fitScore: 97,
        naverMapUrl: "https://map.naver.com/",
        kakaoMapUrl: "https://map.kakao.com/",
        tags: ["단체", "분위기 맛집"],
        representativeMenu: ["김밥", "라면", "떡볶이"],
        photos: [
          { id: "ph1", url: "" },
          { id: "ph2", url: "" },
          { id: "ph3", url: "" },
        ],
      },
      {
        id: "r2",
        name: "동작 돈까스",
        travelTimeMinutes: 15,
        fitScore: 91,
        naverMapUrl: "https://map.naver.com/",
        kakaoMapUrl: "https://map.kakao.com/",
        tags: ["가성비", "단체"],
        representativeMenu: ["등심까스", "치즈까스"],
        photos: [
          { id: "ph1", url: "" },
          { id: "ph2", url: "" },
          { id: "ph3", url: "" },
        ],
      },
      {
        id: "r3",
        name: "흑석 라멘집",
        travelTimeMinutes: 25,
        fitScore: 88,
        naverMapUrl: "https://map.naver.com/",
        kakaoMapUrl: "https://map.kakao.com/",
        tags: ["혼밥", "분위기 맛집"],
        representativeMenu: ["차슈라멘", "교자"],
        photos: [
          { id: "ph1", url: "" },
          { id: "ph2", url: "" },
          { id: "ph3", url: "" },
        ],
      },
    ],
  };
}
