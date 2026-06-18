import type { Location } from "../model/types";

export interface SetMeetingLocationInput {
  code: string;
  location: Location;
}

/**
 * 큐레이션 흐름에서 호스트가 정한 "모임 장소"를 저장한다.
 * 멤버별 출발지(`updateMemberLocation`)와 다르게 방 단위로 1개만 존재.
 *
 * 모임 메타데이터는 Supabase에 있고, 백엔드에는 "확정 장소" 저장 API가
 * 아직 없으므로 meetingLocation만 클라이언트(localStorage)에 보관한다.
 * fetch-room-status가 같은 키에서 읽어 RoomCurationView 분기에 사용한다.
 */
export async function setMeetingLocation(
  input: SetMeetingLocationInput,
): Promise<void> {
  if (typeof window === "undefined") return;

  // room-{code} 키가 없을 수 있으므로(모임은 Supabase에 저장됨) 없으면 새로 만든다.
  const raw = localStorage.getItem(`room-${input.code}`);
  let roomData: Record<string, unknown> = {};
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        roomData = parsed as Record<string, unknown>;
      }
    } catch {
      // 파싱 실패 시 빈 객체로 새로 시작
    }
  }

  roomData.meetingLocation = input.location;
  localStorage.setItem(`room-${input.code}`, JSON.stringify(roomData));
}
