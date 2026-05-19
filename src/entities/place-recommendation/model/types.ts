/** 멤버 한 명의 해당 장소까지의 예상 이동 정보 */
export interface MemberTravel {
  memberId: string;
  memberName: string;
  /** 예상 이동 소요 시간(분) */
  minutes: number;
}

/**
 * 추천된 모임 장소 1곳.
 * 백엔드 스키마 확정 시 주소·평점 등으로 확장한다.
 */
export interface RecommendedPlace {
  id: string;
  name: string;
  /** 분류 — 예: "지하철역", "대학가" */
  category: string;
  lat: number;
  lng: number;
  /** 멤버별 예상 이동 시간 */
  memberTravels: MemberTravel[];
  /** 멤버 평균 이동 시간(분) */
  averageMinutes: number;
}

/** 추천 근거가 된 멤버 출발지 — 지도 마커 표시용 */
export interface MemberOrigin {
  memberId: string;
  memberName: string;
  lat: number;
  lng: number;
}

/** 장소 추천 결과 */
export interface PlaceRecommendationResult {
  places: RecommendedPlace[];
  origins: MemberOrigin[];
}
