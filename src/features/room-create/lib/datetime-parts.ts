export interface DateTimeParts {
  date: Date;
  hour24: number;
  minute: number;
}

export function parseDateTime(s: string): DateTimeParts | null {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return {
    date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
    hour24: d.getHours(),
    minute: d.getMinutes(),
  };
}

export function combineDateTime(
  date: Date,
  hour24: number,
  minute: number,
): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(hour24).padStart(2, "0");
  const mi = String(minute).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getMonthGrid(year: number, month: number): (Date | null)[] {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length < 42) cells.push(null);
  return cells;
}

export function to24h(period: "오전" | "오후", hour12: number): number {
  if (period === "오전") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

export function to12h(hour24: number): {
  period: "오전" | "오후";
  hour12: number;
} {
  const period: "오전" | "오후" = hour24 < 12 ? "오전" : "오후";
  const mod = hour24 % 12;
  const hour12 = mod === 0 ? 12 : mod;
  return { period, hour12 };
}

const previewFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "short",
});

export function formatDatePreview(d: Date): string {
  return previewFormatter.format(d);
}
