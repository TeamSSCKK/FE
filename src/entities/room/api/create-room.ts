import { apiClient } from "@/shared/api/axios-instance";
import { saveSessionData } from "@/shared/lib/room-session";
import type { CreateRoomInput, CreateRoomResult } from "../model/types";

export async function createRoom(
  input: CreateRoomInput,
): Promise<CreateRoomResult> {
  const meetingRes = await apiClient.post<{
    meetingId: number | string;
    inviteCode: string;
    status: string;
  }>("/functions/v1/create-meeting", {
    meetingName: input.name,
    meetingDatetime: input.dateTime,
  });
  // 백엔드는 id를 숫자로 내려주므로 즉시 문자열로 정규화한다.
  const meetingId = String(meetingRes.data.meetingId);
  const { inviteCode } = meetingRes.data;

  const joinRes = await apiClient.post<{
    participantId: number | string;
    accessToken: string;
    meetingId: number | string;
  }>("/functions/v1/join-meeting", {
    inviteCode,
    participantName: input.hostName,
  });
  const participantId = String(joinRes.data.participantId);
  const { accessToken } = joinRes.data;

  saveSessionData(inviteCode, { participantId, accessToken, meetingId });

  // 이 기기가 모임 생성자임을 기록 (호스트 식별용)
  if (typeof window !== "undefined") {
    localStorage.setItem(`moyeo_creator_${inviteCode}`, participantId);
  }

  return { code: inviteCode, meetingId };
}
