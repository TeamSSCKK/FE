export interface LatLng {
  lat: number;
  lng: number;
}

/** 지도에 표시할 마커 */
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  /** 마커 종류 — 스타일 구분 */
  variant: "place" | "place-focused" | "member";
  /** 마커에 표시할 텍스트 (장소명 / 멤버 이니셜) */
  label: string;
  onClick?: () => void;
}

export interface NaverMapProps {
  /** 지도 중심 좌표. 변경 시 지도가 그 위치로 이동한다(센터 핀이 가리키는 곳). */
  center: LatLng;
  /** 사용자가 지도를 움직여 멈춘 순간(idle)의 지도 중심 좌표. 프로그래매틱 이동은 제외된다. */
  onMapIdle?: (latlng: LatLng) => void;
  onReady?: () => void;
  className?: string;
  /** 지도에 렌더링할 마커 목록. 매 렌더 재생성을 피하려면 호출부에서 메모이즈한다. */
  markers?: MapMarker[];
  /** 화면 중앙 고정 핀 표시 여부. 기본 true (위치 입력 화면 호환). */
  showCenterPin?: boolean;
}

declare global {
  interface Window {
    naver: any;
  }
}

export {};
