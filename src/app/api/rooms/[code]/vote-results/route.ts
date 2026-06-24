import { NextRequest, NextResponse } from "next/server";

// 실시간 투표 현황이므로 캐싱하지 않는다.
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

interface VoteRow {
  participant_id: number;
  vote_type: string;
  place_candidate_id: number | null;
  restaurant_candidate_id: number | null;
  voted_at: string;
}

interface CandidateTally {
  candidateId: string;
  count: number;
}

/**
 * 백엔드 get-vote-results 미배포 시 폴백.
 * vote 테이블(참가자별)을 직접 집계해 get-vote-results와 동일한 형태로 돌려준다.
 * 동률/선두 판정은 entities/vote/deriveWinner와 동일 규칙(단독 최다 → 선두, 공동 최다 → 동률).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  const { code } = params;
  const voteType =
    req.nextUrl.searchParams.get("voteType") === "RESTAURANT"
      ? "RESTAURANT"
      : "PLACE";

  const meetings = await sb<{ meeting_id: number }>(
    `meeting?invite_link=eq.${encodeURIComponent(code)}&select=meeting_id`,
  );
  if (!meetings.length) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }
  const meetingId = meetings[0].meeting_id;

  const participants = await sb<{ participant_id: number }>(
    `participant?meeting_id=eq.${meetingId}&select=participant_id`,
  );
  const participantIds = participants.map((p) => p.participant_id).join(",");

  // vote 테이블엔 meeting_id가 없어 참가자 id로 조회한다.
  const votes = participantIds
    ? await sb<VoteRow>(
        `vote?participant_id=in.(${participantIds})&vote_type=eq.${voteType}&select=participant_id,vote_type,place_candidate_id,restaurant_candidate_id,voted_at`,
      )
    : [];

  // 참가자별 최신 1표만 집계(백엔드가 교체 저장하지만 중복 방어).
  const latestByParticipant = new Map<number, VoteRow>();
  for (const v of votes) {
    const prev = latestByParticipant.get(v.participant_id);
    if (!prev || v.voted_at > prev.voted_at) {
      latestByParticipant.set(v.participant_id, v);
    }
  }

  const counts = new Map<string, number>();
  for (const v of latestByParticipant.values()) {
    const id =
      voteType === "PLACE" ? v.place_candidate_id : v.restaurant_candidate_id;
    if (id == null) continue;
    const key = String(id);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const tally: CandidateTally[] = [...counts.entries()]
    .map(([candidateId, count]) => ({ candidateId, count }))
    .sort((a, b) => b.count - a.count);

  // 선두/동률 도출
  const maxCount = tally.length ? Math.max(...tally.map((t) => t.count)) : 0;
  const top = tally.filter((t) => t.count === maxCount).map((t) => t.candidateId);
  const isTie = top.length > 1;
  const winnerId = top.length === 1 ? top[0] : null;

  // 확정 여부: final_decision의 해당 voteType 컬럼 존재 여부
  const decisions = await sb<{
    final_place_candidate_id: number | null;
    final_restaurant_candidate_id: number | null;
  }>(
    `final_decision?meeting_id=eq.${meetingId}&select=final_place_candidate_id,final_restaurant_candidate_id`,
  );
  const decidedId =
    voteType === "PLACE"
      ? decisions[0]?.final_place_candidate_id
      : decisions[0]?.final_restaurant_candidate_id;
  const finalCandidateId = decidedId != null ? String(decidedId) : null;

  // 내 투표(참가자 id가 주어진 경우) — 이미 집계한 latestByParticipant 재사용.
  const myPid = req.nextUrl.searchParams.get("participantId");
  let myCandidateId: string | null = null;
  if (myPid) {
    const mine = latestByParticipant.get(Number(myPid));
    const id = mine
      ? voteType === "PLACE"
        ? mine.place_candidate_id
        : mine.restaurant_candidate_id
      : null;
    myCandidateId = id != null ? String(id) : null;
  }

  return NextResponse.json({
    voteType,
    tally,
    winnerId,
    isTie,
    topCandidates: top,
    finalized: finalCandidateId != null,
    finalCandidateId,
    myCandidateId,
  });
}
