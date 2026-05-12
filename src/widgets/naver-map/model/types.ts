export interface LatLng {
  lat: number;
  lng: number;
}

export interface NaverMapProps {
  center: LatLng;
  marker?: LatLng;
  markerLabel?: string;
  onMapClick?: (latlng: LatLng) => void;
  onMarkerDragEnd?: (latlng: LatLng) => void;
  onReady?: () => void;
  className?: string;
}

declare global {
  interface Window {
    naver: any;
  }
}

export {};
