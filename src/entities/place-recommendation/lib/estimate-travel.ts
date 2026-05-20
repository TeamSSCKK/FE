/** 위경도 좌표 */
interface Coord {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** 두 좌표 사이의 직선 거리(km) — 하버사인 공식 */
export function haversineKm(a: Coord, b: Coord): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(h));
}

/**
 * 직선 거리를 대중교통 이동 시간(분)으로 러프하게 환산한다.
 * 평균 22km/h + 기본 대기 5분 가정 — 백엔드 연동 전까지의 추정치.
 */
export function estimateTravelMinutes(a: Coord, b: Coord): number {
  const km = haversineKm(a, b);
  return Math.round((km / 22) * 60) + 5;
}
