const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(): string {
  const left = Array.from({ length: 5 }, () =>
    ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
  ).join("");
  const right = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 10).toString(),
  ).join("");
  return `${left}-${right}`;
}
