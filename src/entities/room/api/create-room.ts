import { apiClient } from "@/shared/api/axios-instance";
import { saveSessionData } from "@/shared/lib/room-session";
import type { CreateRoomInput, CreateRoomResult } from "../model/types";

export async function createRoom(
  input: CreateRoomInput,
): Promise<CreateRoomResult> {
  const meetingRes = await apiClient.post<{
    meetingId: string;
    inviteCode: string;
    status: string;
  }>("/functions/v1/create-meeting", {
    meetingName: input.name,
    meetingDatetime: input.dateTime,
  });
  const { meetingId, inviteCode } = meetingRes.data;

  const joinRes = await apiClient.post<{
    participantId: string;
    accessToken: string;
    meetingId: string;
  }>("/functions/v1/join-meeting", {
    inviteCode,
    participantName: input.hostName,
  });
  const { participantId, accessToken } = joinRes.data;

  saveSessionData(inviteCode, { participantId, accessToken, meetingId });

  // 이 기기가 모임 생성자임을 기록 (호스트 식별용)
  if (typeof window !== "undefined") {
    localStorage.setItem(`moyeo_creator_${inviteCode}`, participantId);
  }

  return { code: inviteCode, meetingId };
}
