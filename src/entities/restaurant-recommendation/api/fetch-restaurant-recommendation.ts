import type { RestaurantRecommendationResult } from "../model/types";

export async function fetchRestaurantRecommendation(
  code: string,
): Promise<RestaurantRecommendationResult> {
  void code;
  await new Promise((r) => setTimeout(r, 2500));
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
          { id: "p1", url: "" },
          { id: "p2", url: "" },
          { id: "p3", url: "" },
        ],
      },
      {
        id: "r2",
        name: "동작 돈까스",
        travelTimeMinutes: 15,
        fitScore: 91,
        naverMapUrl: "https://map.naver.com/",
        kakaoMapUrl: "https://map.kakao.com/",
        tags: ["가성비"],
        representativeMenu: ["등심까스", "치즈까스"],
        photos: [
          { id: "p1", url: "" },
          { id: "p2", url: "" },
          { id: "p3", url: "" },
        ],
      },
      {
        id: "r3",
        name: "흑석 라멘집",
        travelTimeMinutes: 25,
        fitScore: 88,
        naverMapUrl: "https://map.naver.com/",
        kakaoMapUrl: "https://map.kakao.com/",
        tags: ["분위기 맛집"],
        representativeMenu: ["차슈라멘"],
        photos: [
          { id: "p1", url: "" },
          { id: "p2", url: "" },
          { id: "p3", url: "" },
        ],
      },
    ],
  };
}
