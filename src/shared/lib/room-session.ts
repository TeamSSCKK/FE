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
  // 백엔드가 participantId/meetingId를 숫자로 내려주므로 문자열로 정규화한다.
  // fetch-room-status의 member.id(String(participant_id))와 === 비교가 어긋나지 않도록 보장.
  const normalized: RoomSessionData = {
    participantId: String(data.participantId),
    accessToken: String(data.accessToken),
    meetingId: String(data.meetingId),
  };
  sessionStorage.setItem(sessionKey(roomCode), JSON.stringify(normalized));
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
  // 정규화 이전에 숫자로 저장된 기존 세션까지 안전하게 문자열로 반환한다.
  if (session) return String(session.participantId);
  return sessionStorage.getItem("moyeo_member_" + roomCode);
}

export function clearMemberId(roomCode: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("moyeo_member_" + roomCode);
  sessionStorage.removeItem(sessionKey(roomCode));
}
