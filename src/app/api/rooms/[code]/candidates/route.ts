import { NextRequest, NextResponse } from "next/server";

// 저장된 추천 결과(place_candidate)를 항상 최신으로 조회한다.
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

interface PlaceCandidateRow {
  place_candidate_id: number;
  place_name: string;
  category: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  avg_pub_travel_time: number | null;
  max_travel_minutes: number | null;
  travel_time_stddev_minutes: number | null;
  recommendation_score: number | null;
  recommendation_rank: number | null;
  calculation_method: string | null;
}

interface TravelRow {
  place_candidate_id: number;
  participant_id: number;
  travel_minutes: number;
}

interface ParticipantRow {
  participant_id: number;
  participant_name: string;
}

interface LocationRow {
  participant_id: number;
  latitude: number;
  longitude: number;
}

/**
 * 이미 추천이 끝난 모임(상태가 PLACE_VOTING 이후)은 recommend-places가 409를
 * 반환하므로, 저장된 place_candidate를 recommend-places 응답과 동일한 형태로
 * 재구성해 돌려준다. (재진입 시 추천 결과 복원용)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } },
) {
  const { code } = params;

  const meetings = await sb<{ meeting_id: number }>(
    `meeting?invite_link=eq.${encodeURIComponent(code)}&select=meeting_id`,
  );
  if (!meetings.length) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }
  const meetingId = meetings[0].meeting_id;

  const candidates = await sb<PlaceCandidateRow>(
    `place_candidate?meeting_id=eq.${meetingId}&select=place_candidate_id,place_name,category,address,latitude,longitude,avg_pub_travel_time,max_travel_minutes,travel_time_stddev_minutes,recommendation_score,recommendation_rank,calculation_method&order=recommendation_rank.asc`,
  );

  const participants = await sb<ParticipantRow>(
    `participant?meeting_id=eq.${meetingId}&select=participant_id,participant_name`,
  );
  const nameById = new Map(
    participants.map((p) => [p.participant_id, p.participant_name]),
  );

  const candidateIds = candidates.map((c) => c.place_candidate_id).join(",");
  const travels = candidateIds
    ? await sb<TravelRow>(
        `place_candidate_travel?place_candidate_id=in.(${candidateIds})&select=place_candidate_id,participant_id,travel_minutes`,
      )
    : [];

  const travelsByCandidate = new Map<
    number,
    { memberId: string; memberName: string; minutes: number }[]
  >();
  for (const t of travels) {
    const list = travelsByCandidate.get(t.place_candidate_id) ?? [];
    list.push({
      memberId: String(t.participant_id),
      memberName: nameById.get(t.participant_id) ?? "",
      minutes: t.travel_minutes,
    });
    travelsByCandidate.set(t.place_candidate_id, list);
  }

  const participantIds = participants.map((p) => p.participant_id).join(",");
  const locations = participantIds
    ? await sb<LocationRow>(
        `participant_location?participant_id=in.(${participantIds})&select=participant_id,latitude,longitude`,
      )
    : [];

  const origins = locations.map((l) => ({
    memberId: String(l.participant_id),
    memberName: nameById.get(l.participant_id) ?? "",
    lat: l.latitude,
    lng: l.longitude,
  }));

  const places = candidates.map((c) => ({
    id: String(c.place_candidate_id),
    name: c.place_name,
    category: c.category ?? "",
    address: c.address ?? undefined,
    lat: c.latitude,
    lng: c.longitude,
    rank: c.recommendation_rank ?? undefined,
    averageMinutes: c.avg_pub_travel_time ?? 0,
    maxMinutes: c.max_travel_minutes ?? undefined,
    standardDeviation: c.travel_time_stddev_minutes ?? undefined,
    fairnessScore: c.recommendation_score ?? undefined,
    memberTravels: travelsByCandidate.get(c.place_candidate_id) ?? [],
  }));

  const calculationMethod = candidates[0]?.calculation_method ?? "DISTANCE_FALLBACK";

  return NextResponse.json({ calculationMethod, places, origins });
}
