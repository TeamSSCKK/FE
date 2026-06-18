import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function supabaseHeaders() {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=minimal",
  };
}

interface LocationBody {
  participantId: string;
  label: string;
  roadAddress: string;
  lat: number;
  lng: number;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as LocationBody;
  const participantId = Number(body.participantId);

  const upsertRes = await fetch(`${supabaseUrl}/rest/v1/participant_location`, {
    method: "POST",
    headers: supabaseHeaders(),
    body: JSON.stringify({
      participant_id: participantId,
      place_name: body.label,
      address: body.roadAddress,
      latitude: body.lat,
      longitude: body.lng,
    }),
  });

  if (!upsertRes.ok) {
    const err = await upsertRes.text();
    return NextResponse.json({ error: err }, { status: 502 });
  }

  const patchRes = await fetch(
    `${supabaseUrl}/rest/v1/participant?participant_id=eq.${participantId}`,
    {
      method: "PATCH",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ input_location_yn: true }),
    },
  );

  if (!patchRes.ok) {
    const err = await patchRes.text();
    return NextResponse.json({ error: err }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
