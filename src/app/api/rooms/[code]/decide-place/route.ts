import { NextRequest, NextResponse } from "next/server";

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

/**
 * 위치 투표 결과를 확정 장소로 기록한다.
 *
 * 백엔드 close-vote(PLACE)는 모임 상태를 LOCATION_DECIDED로 바꿔 이후 recommend-restaurants를
 * 막는다(상태머신상 PLACE_VOTING에서 close-vote와 식당 추천은 배타적). 따라서 식당 추천까지
 * 이어지는 흐름에서는 close-vote 대신 final_decision.final_place_candidate_id만 upsert하고
 * meeting.status는 PLACE_VOTING으로 유지한다.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  const { code } = params;
  const body = (await req.json().catch(() => ({}))) as {
    placeCandidateId?: string | number;
  };
  const placeCandidateId = Number(body.placeCandidateId);
  if (!placeCandidateId) {
    return NextResponse.json(
      { error: "placeCandidateId가 필요합니다." },
      { status: 400 },
    );
  }

  const meetingRes = await fetch(
    `${supabaseUrl}/rest/v1/meeting?invite_link=eq.${encodeURIComponent(code)}&select=meeting_id`,
    { headers: supabaseHeaders(), cache: "no-store" },
  );
  const meetings = (await meetingRes.json()) as { meeting_id: number }[];
  if (!meetings.length) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }
  const meetingId = meetings[0].meeting_id;

  // 기존 final_decision 행이 있으면 PATCH, 없으면 POST. (status는 절대 변경하지 않는다.)
  const existRes = await fetch(
    `${supabaseUrl}/rest/v1/final_decision?meeting_id=eq.${meetingId}&select=decision_id`,
    { headers: supabaseHeaders(), cache: "no-store" },
  );
  const existing = existRes.ok
    ? ((await existRes.json()) as { decision_id: number }[])
    : [];

  const writeRes = existing.length
    ? await fetch(
        `${supabaseUrl}/rest/v1/final_decision?meeting_id=eq.${meetingId}`,
        {
          method: "PATCH",
          headers: supabaseHeaders(),
          body: JSON.stringify({ final_place_candidate_id: placeCandidateId }),
        },
      )
    : await fetch(`${supabaseUrl}/rest/v1/final_decision`, {
        method: "POST",
        headers: supabaseHeaders(),
        body: JSON.stringify({
          meeting_id: meetingId,
          final_place_candidate_id: placeCandidateId,
        }),
      });

  if (!writeRes.ok) {
    return NextResponse.json(
      { error: "확정 장소 저장에 실패했어요." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    meetingId: String(meetingId),
    placeCandidateId: String(placeCandidateId),
  });
}
