const formatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeStyle: "short",
});

export function formatKoreanDateTime(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return formatter.format(d);
}
