import type { Location } from "../model/types";

export interface SetMeetingLocationInput {
  code: string;
  location: Location;
}

/**
 * 큐레이션 흐름에서 호스트가 정한 "모임 장소"를 방 데이터에 저장한다.
 * 멤버별 출발지(`updateMemberLocation`)와 다르게 방 단위로 1개만 존재.
 */
export async function setMeetingLocation(
  input: SetMeetingLocationInput,
): Promise<void> {
  // TODO: apiClient 교체
  await new Promise((r) => setTimeout(r, 350));

  const raw = localStorage.getItem(`room-${input.code}`);
  if (!raw) throw new Error("Room not found");

  const roomData = JSON.parse(raw);
  roomData.meetingLocation = input.location;
  localStorage.setItem(`room-${input.code}`, JSON.stringify(roomData));
}
