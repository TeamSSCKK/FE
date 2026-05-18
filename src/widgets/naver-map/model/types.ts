export interface LatLng {
  lat: number;
  lng: number;
}

export interface NaverMapProps {
  /** 지도 중심 좌표. 변경 시 지도가 그 위치로 이동한다(센터 핀이 가리키는 곳). */
  center: LatLng;
  /** 사용자가 지도를 움직여 멈춘 순간(idle)의 지도 중심 좌표. 프로그래매틱 이동은 제외된다. */
  onMapIdle?: (latlng: LatLng) => void;
  onReady?: () => void;
  className?: string;
}

declare global {
  interface Window {
    naver: any;
  }
}

export {};
