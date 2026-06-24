import { NextRequest, NextResponse } from "next/server";

// 저장된 식당 후보(restaurant_candidate)를 읽기 전용으로 조회한다.
// 투표 화면이 추천 생성(recommend-restaurants)을 재트리거하지 않도록, 생성은
// 호스트 큐레이션 경로에서만 수행하고 투표 화면은 이 라우트로 후보만 읽는다.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function supabaseHeaders() {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
}

async function sb<T>(path: string): Promise<T[]> {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: supabaseHeaders(),
    cache: "no-store",
  });
  return res.ok ? ((await res.json()) as T[]) : [];
}

interface PlaceRow {
  place_candidate_id: number;
  meeting_id: number;
  place_name: string;
  latitude: number;
  longitude: number;
}

interface RestaurantRow {
  restaurant_candidate_id: number;
  restaurant_name: string;
  category: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  distance_meters: number | null;
  preference_score: number | null;
  recommendation_rank: number | null;
  source_url: string | null;
}

/**
 * GET ?placeId=<place_candidate_id>
 * recommend-restaurants와 동일한 형태({ place, restaurants[] })로 반환해
 * 프론트의 기존 매핑(mapBackendResult)을 그대로 재사용할 수 있게 한다.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  const { code } = params;
  const placeId = req.nextUrl.searchParams.get("placeId");
  if (!placeId) {
    return NextResponse.json({ error: "placeId가 필요합니다." }, { status: 400 });
  }

  const meetings = await sb<{ meeting_id: number }>(
    `meeting?invite_link=eq.${encodeURIComponent(code)}&select=meeting_id`,
  );
  if (!meetings.length) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }
  const meetingId = meetings[0].meeting_id;

  // 장소 후보가 해당 모임의 것인지 확인하며 장소 정보를 가져온다.
  const placeRows = await sb<PlaceRow>(
    `place_candidate?place_candidate_id=eq.${encodeURIComponent(placeId)}&meeting_id=eq.${meetingId}&select=place_candidate_id,meeting_id,place_name,latitude,longitude`,
  );
  if (!placeRows.length) {
    return NextResponse.json(
      { error: "장소 후보를 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  const place = placeRows[0];

  const rows = await sb<RestaurantRow>(
    `restaurant_candidate?place_candidate_id=eq.${place.place_candidate_id}&select=restaurant_candidate_id,restaurant_name,category,address,latitude,longitude,distance_meters,preference_score,recommendation_rank,source_url&order=recommendation_rank.asc`,
  );

  return NextResponse.json({
    place: {
      id: String(place.place_candidate_id),
      name: place.place_name,
      lat: place.latitude,
      lng: place.longitude,
    },
    restaurants: rows.map((r) => ({
      id: String(r.restaurant_candidate_id),
      name: r.restaurant_name,
      category: r.category ?? undefined,
      address: r.address ?? undefined,
      lat: r.latitude,
      lng: r.longitude,
      distanceMeters: r.distance_meters ?? undefined,
      preferenceScore: r.preference_score ?? undefined,
      rank: r.recommendation_rank ?? undefined,
      matchedLikes: [],
      sourceUrl: r.source_url ?? undefined,
    })),
  });
}
