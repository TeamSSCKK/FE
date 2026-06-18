import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { memberId: string } },
) {
  const participantId = Number(params.memberId);
  if (Number.isNaN(participantId)) {
    return NextResponse.json({ error: "Invalid memberId" }, { status: 400 });
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/participant?participant_id=eq.${participantId}`,
    {
      method: "DELETE",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=minimal",
      },
    },
  );

  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
