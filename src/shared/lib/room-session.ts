/**
 * 방 세션 관리 유틸리티
 * 참가자 ID를 sessionStorage에 저장하고 불러오는 기능을 제공합니다.
 */

/**
 * 방 참가자 ID를 sessionStorage에 저장합니다.
 * @param roomCode 방 코드
 * @param memberId 참가자 ID
 */
export function saveMemberId(roomCode: string, memberId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("moyeo_member_" + roomCode, memberId);
}

/**
 * 방 참가자 ID를 sessionStorage에서 불러옵니다.
 * @param roomCode 방 코드
 * @returns 참가자 ID 또는 null
 */
export function loadMemberId(roomCode: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("moyeo_member_" + roomCode);
}

/**
 * 방 참가자 ID를 sessionStorage에서 제거합니다.
 * @param roomCode 방 코드
 */
export function clearMemberId(roomCode: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("moyeo_member_" + roomCode);
}