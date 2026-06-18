import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function supabaseHeaders(extra?: Record<string, string>) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

interface PreferenceRow {
  preference_type: string;
  preference_value: string;
}

interface PreferenceBody {
  participantId: string;
  rows: PreferenceRow[];
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as PreferenceBody;
  const participantId = Number(body.participantId);

  // 기존 취향 삭제 후 재삽입 (upsert 대신 delete + insert)
  const deleteRes = await fetch(
    `${supabaseUrl}/rest/v1/participant_preference?participant_id=eq.${participantId}`,
    {
      method: "DELETE",
      headers: supabaseHeaders({ Prefer: "return=minimal" }),
    },
  );
  if (!deleteRes.ok && deleteRes.status !== 404) {
    return NextResponse.json({ error: await deleteRes.text() }, { status: 502 });
  }

  if (body.rows.length > 0) {
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/participant_preference`, {
      method: "POST",
      headers: supabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify(
        body.rows.map((r) => ({ participant_id: participantId, ...r })),
      ),
    });
    if (!insertRes.ok) {
      return NextResponse.json({ error: await insertRes.text() }, { status: 502 });
    }
  }

  const patchRes = await fetch(
    `${supabaseUrl}/rest/v1/participant?participant_id=eq.${participantId}`,
    {
      method: "PATCH",
      headers: supabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({ input_preference_yn: true }),
    },
  );
  if (!patchRes.ok) {
    return NextResponse.json({ error: await patchRes.text() }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
