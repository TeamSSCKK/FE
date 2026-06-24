export interface RoomSessionData {
  participantId: string;
  accessToken: string;
  meetingId: string;
}

function sessionKey(roomCode: string) {
  return `moyeo_session_${roomCode}`;
}

function memberKey(roomCode: string) {
  return "moyeo_member_" + roomCode;
}

// 참가자 신원은 '내 모임' 목록(moyeo_joined_rooms, localStorage)과 수명을 맞춰야 한다.
// sessionStorage에 두면 브라우저를 닫는 순간 신원이 사라져, 목록에는 모임이 남아 있는데
// 다시 들어가면 guest로 취급돼 이름 입력 화면으로 빠진다. 그래서 localStorage를 사용한다.
export function saveSessionData(roomCode: string, data: RoomSessionData): void {
  if (typeof window === "undefined") return;
  // 백엔드가 participantId/meetingId를 숫자로 내려주므로 문자열로 정규화한다.
  // fetch-room-status의 member.id(String(participant_id))와 === 비교가 어긋나지 않도록 보장.
  const normalized: RoomSessionData = {
    participantId: String(data.participantId),
    accessToken: String(data.accessToken),
    meetingId: String(data.meetingId),
  };
  localStorage.setItem(sessionKey(roomCode), JSON.stringify(normalized));
}

export function loadSessionData(roomCode: string): RoomSessionData | null {
  if (typeof window === "undefined") return null;
  // 과거 세션에 sessionStorage로 저장된 신원도 함께 복구한다(localStorage 우선).
  const raw =
    localStorage.getItem(sessionKey(roomCode)) ??
    sessionStorage.getItem(sessionKey(roomCode));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RoomSessionData;
  } catch {
    return null;
  }
}

export function saveMemberId(roomCode: string, memberId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(memberKey(roomCode), memberId);
}

export function loadMemberId(roomCode: string): string | null {
  if (typeof window === "undefined") return null;
  const session = loadSessionData(roomCode);
  // 정규화 이전에 숫자로 저장된 기존 세션까지 안전하게 문자열로 반환한다.
  if (session) return String(session.participantId);
  return (
    localStorage.getItem(memberKey(roomCode)) ??
    sessionStorage.getItem(memberKey(roomCode))
  );
}

export function clearMemberId(roomCode: string): void {
  if (typeof window === "undefined") return;
  // 로그아웃/나가기: 두 저장소 모두에서 신원을 제거한다.
  localStorage.removeItem(memberKey(roomCode));
  localStorage.removeItem(sessionKey(roomCode));
  sessionStorage.removeItem(memberKey(roomCode));
  sessionStorage.removeItem(sessionKey(roomCode));
}
