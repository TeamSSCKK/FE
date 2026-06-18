import { NextRequest, NextResponse } from "next/server";

// 폴링으로 실시간 참가자 현황을 받아야 하므로 이 라우트는 절대 캐싱하지 않는다.
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

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } },
) {
  const { code } = params;

  const meetingRes = await fetch(
    `${supabaseUrl}/rest/v1/meeting?invite_link=eq.${encodeURIComponent(code)}&select=meeting_id,meeting_name,meeting_datetime,invite_link,status,created_at`,
    { headers: supabaseHeaders(), cache: "no-store" },
  );
  if (!meetingRes.ok) {
    return NextResponse.json({ error: "Supabase error" }, { status: 502 });
  }
  const meetings = (await meetingRes.json()) as unknown[];
  if (!meetings.length) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }
  const meeting = meetings[0] as { meeting_id: number };

  const participantRes = await fetch(
    `${supabaseUrl}/rest/v1/participant?meeting_id=eq.${meeting.meeting_id}&select=participant_id,participant_name,role,input_location_yn,input_preference_yn,place_vote_yn,restaurant_vote_yn`,
    { headers: supabaseHeaders(), cache: "no-store" },
  );
  const participants = participantRes.ok
    ? ((await participantRes.json()) as unknown[])
    : [];

  const participantIds = (participants as { participant_id: number }[])
    .map((p) => p.participant_id)
    .join(",");

  let locations: unknown[] = [];
  if (participantIds) {
    const locRes = await fetch(
      `${supabaseUrl}/rest/v1/participant_location?participant_id=in.(${participantIds})&select=participant_id,place_name,address,latitude,longitude`,
      { headers: supabaseHeaders(), cache: "no-store" },
    );
    if (locRes.ok) locations = (await locRes.json()) as unknown[];
  }

  return NextResponse.json({ meeting, participants, locations });
}
