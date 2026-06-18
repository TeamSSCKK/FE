import { type NextRequest, NextResponse } from "next/server";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://oufchidafmrxgympbcqo.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

async function proxyToEdgeFunction(
  req: NextRequest,
  path: string[],
): Promise<NextResponse> {
  const fnPath = path.join("/");
  const targetUrl = `${SUPABASE_URL}/functions/v1/${fnPath}`;

  const body = req.method !== "GET" && req.method !== "HEAD"
    ? await req.text()
    : undefined;

  const res = await fetch(targetUrl, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body,
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxyToEdgeFunction(req, params.path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxyToEdgeFunction(req, params.path);
}
