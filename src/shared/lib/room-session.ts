export interface RoomSessionData {
  participantId: string;
  accessToken: string;
  meetingId: string;
}

function sessionKey(roomCode: string) {
  return `moyeo_session_${roomCode}`;
}

export function saveSessionData(roomCode: string, data: RoomSessionData): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(sessionKey(roomCode), JSON.stringify(data));
}

export function loadSessionData(roomCode: string): RoomSessionData | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(sessionKey(roomCode));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RoomSessionData;
  } catch {
    return null;
  }
}

export function saveMemberId(roomCode: string, memberId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("moyeo_member_" + roomCode, memberId);
}

export function loadMemberId(roomCode: string): string | null {
  if (typeof window === "undefined") return null;
  const session = loadSessionData(roomCode);
  if (session) return session.participantId;
  return sessionStorage.getItem("moyeo_member_" + roomCode);
}

export function clearMemberId(roomCode: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("moyeo_member_" + roomCode);
  sessionStorage.removeItem(sessionKey(roomCode));
}
