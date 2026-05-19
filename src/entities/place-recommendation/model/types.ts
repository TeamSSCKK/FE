/**
 * 추천 장소 1건.
 * 결과 화면이 아직 미구현이라 최소 필드만 둔다 —
 * 백엔드 스키마 확정 시 좌표·주소·점수 등으로 확장한다.
 */
export interface RecommendedPlace {
  id: string;
  name: string;
}

/** 장소 추천 결과 */
export interface PlaceRecommendationResult {
  places: RecommendedPlace[];
}
