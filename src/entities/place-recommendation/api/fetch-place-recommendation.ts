import type {
  MemberOrigin,
  PlaceRecommendationResult,
  RecommendedPlace,
} from "../model/types";
import { estimateTravelMinutes } from "../lib/estimate-travel";

// TODO: apiClient 교체
// 실제 백엔드는 멤버들의 출발지를 기반으로 중간지점 장소를 산출한다.
// 지금은 mock — localStorage의 멤버 출발지를 읽어 그 무게중심 주변에 후보를 만든다.
const MOCK_DELAY = 2500;

// 개발 중 에러 화면 확인용 — true로 바꾸면 추천 실패를 시뮬레이션한다.
const MOCK_FORCE_ERROR = false;

// 위치 입력 멤버가 한 명도 없을 때의 폴백 좌표 (서울시청)
const SEOUL = { lat: 37.5666, lng: 126.9784 };

/** 무게중심 주변에 배치할 추천 후보 프리셋 (offset 단위: 위경도 도) */
const PLACE_PRESETS: ReadonlyArray<{
  name: string;
  category: string;
  dLat: number;
  dLng: number;
}> = [
  { name: "가운데역", category: "지하철역", dLat: 0.004, dLng: 0.003 },
  { name: "모임 광장", category: "만남의 장소", dLat: -0.005, dLng: 0.006 },
  { name: "중앙 상권", category: "번화가", dLat: 0.007, dLng: -0.004 },
  { name: "센트럴 파크", category: "공원", dLat: -0.006, dLng: -0.005 },
];

/** localStorage의 멤버 목록에서 읽어오는 최소 형태 (entities/room import 금지 — FSD) */
interface StoredMember {
  id: string;
  name: string;
  location?: { lat: number; lng: number };
}

function readOrigins(code: string): MemberOrigin[] {
  const raw = localStorage.getItem(`members-${code}`);
  if (!raw) return [];
  try {
    const members = JSON.parse(raw) as StoredMember[];
    return members
      .filter(
        (m) =>
          m.location != null &&
          typeof m.location.lat === "number" &&
          typeof m.location.lng === "number",
      )
      .map((m) => ({
        memberId: m.id,
        memberName: m.name,
        lat: m.location!.lat,
        lng: m.location!.lng,
      }));
  } catch {
    return [];
  }
}

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

  // 출발지 — 위치 입력 멤버가 없으면 서울시청 기준 단일 폴백
  const realOrigins = readOrigins(code);
  const origins: MemberOrigin[] =
    realOrigins.length > 0
      ? realOrigins
      : [{ memberId: "default", memberName: "기본 위치", ...SEOUL }];

  // 무게중심
  const centroid = {
    lat: origins.reduce((s, o) => s + o.lat, 0) / origins.length,
    lng: origins.reduce((s, o) => s + o.lng, 0) / origins.length,
  };

  // 무게중심 주변에 후보 배치 + 멤버별 이동 시간 산출
  const places: RecommendedPlace[] = PLACE_PRESETS.map((preset, i) => {
    const coord = {
      lat: centroid.lat + preset.dLat,
      lng: centroid.lng + preset.dLng,
    };
    const memberTravels = origins.map((o) => ({
      memberId: o.memberId,
      memberName: o.memberName,
      minutes: estimateTravelMinutes(o, coord),
    }));
    const averageMinutes = Math.round(
      memberTravels.reduce((s, t) => s + t.minutes, 0) / memberTravels.length,
    );
    return {
      id: `place-${i + 1}`,
      name: preset.name,
      category: preset.category,
      lat: coord.lat,
      lng: coord.lng,
      memberTravels,
      averageMinutes,
    };
  }).sort((a, b) => a.averageMinutes - b.averageMinutes);

  return { places, origins };
}
