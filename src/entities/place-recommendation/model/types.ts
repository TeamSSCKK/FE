/**
 * 추천 장소 1건.
 * Phase 2 백엔드 연동 시 DTO 변환 레이어 추가 예정.
 */
export interface MemberTravelTime {
  memberId: string;
  memberName: string;
  minutes: number;
}

export interface RecommendedPlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  averageTravelTimeMinutes: number;
  fitScore: number;
  travelTimesByMember: MemberTravelTime[];
}

/** 장소 추천 결과 */
export interface PlaceRecommendationResult {
  places: RecommendedPlace[];
}
