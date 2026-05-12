import type { PlaceSearchItem } from "../model/types";

export async function searchPlaces(query: string): Promise<PlaceSearchItem[]> {
  if (!query.trim()) return [];
  const res = await fetch(
    `/api/places/search?query=${encodeURIComponent(query)}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("검색 요청에 실패했어요.");
  const json = (await res.json()) as { items: PlaceSearchItem[] };
  return json.items ?? [];
}
