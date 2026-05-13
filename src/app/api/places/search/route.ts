import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface NaverLocalItem {
  title: string;
  link?: string;
  category?: string;
  description?: string;
  telephone?: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query")?.trim();
  if (!query) return NextResponse.json({ items: [] });

  const clientId = process.env.NAVER_SEARCH_CLIENT_ID;
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "NAVER_SEARCH_CLIENT_ID/SECRET 미설정" },
      { status: 500 },
    );
  }

  const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&start=1&sort=random`;

  const upstream = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "upstream error" },
      { status: upstream.status },
    );
  }

  const data = await upstream.json();
  const items = ((data.items ?? []) as NaverLocalItem[]).map((it) => ({
    title: stripHtml(it.title),
    roadAddress: it.roadAddress,
    address: it.address,
    category: it.category,
    lng: Number(it.mapx) / 1e7,
    lat: Number(it.mapy) / 1e7,
  }));

  return NextResponse.json({ items });
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "");
}
