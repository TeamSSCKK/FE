const KEY = "moyeo_joined_rooms";

export function getJoinedCodes(): string[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function addJoinedCode(code: string): void {
  if (typeof window === "undefined") return;
  const current = getJoinedCodes();
  if (current.includes(code)) return;
  localStorage.setItem(KEY, JSON.stringify([code, ...current]));
}

export function removeJoinedCode(code: string): void {
  if (typeof window === "undefined") return;
  const next = getJoinedCodes().filter((c) => c !== code);
  localStorage.setItem(KEY, JSON.stringify(next));
}
