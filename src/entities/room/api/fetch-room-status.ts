import { apiClient } from "@/shared/api/axios-instance";
import { saveSessionData } from "@/shared/lib/room-session";
import type { RoomStatus, Member, Location } from "../model/types";

interface SupabaseMeeting {
  meeting_id: number;
  meeting_name: string;
  meeting_datetime: string;
  invite_link: string;
  status: string;
  created_at: string;
}

interface SupabaseParticipant {
  participant_id: number;
  participant_name: string;
  role: string;
  input_location_yn: boolean;
  input_preference_yn: boolean;
  place_vote_yn: boolean;
  restaurant_vote_yn: boolean;
}

interface SupabaseLocation {
  participant_id: number;
  place_name: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
}

export async function fetchRoomStatus(code: string): Promise<RoomStatus> {
  const res = await fetch(`/api/rooms/${encodeURIComponent(code)}`);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "Room not found" }))) as {
      error: string;
    };
    throw new Error(err.error);
  }
  const data = (await res.json()) as {
    meeting: SupabaseMeeting;
    participants: SupabaseParticipant[];
    locations: SupabaseLocation[];
  };

  const locationMap = new Map(
    data.locations.map((l) => [l.participant_id, l]),
  );

  const creatorParticipantId =
    typeof window !== "undefined"
      ? localStorage.getItem(`moyeo_creator_${code}`)
      : null;

  const members: Member[] = data.participants.map((p) => {
    const loc = locationMap.get(p.participant_id);
    const location: Location | undefined = loc
      ? {
          label: loc.place_name ?? "",
          roadAddress: loc.address ?? "",
          lat: loc.latitude,
          lng: loc.longitude,
        }
      : undefined;

    const isCreator =
      creatorParticipantId !== null &&
      String(p.participant_id) === creatorParticipantId;

    return {
      id: String(p.participant_id),
      name: p.participant_name,
      role: isCreator ? "HOST" : "MEMBER",
      isHost: isCreator,
      hasLocation: p.input_location_yn,
      hasPreference: p.input_preference_yn,
      hasVoted: p.place_vote_yn,
      location,
    };
  });

  const host = members.find((m) => m.isHost);

  const meetingLocation = (() => {
    if (typeof window === "undefined") return undefined;
    try {
      const raw = localStorage.getItem(`room-${code}`);
      if (!raw) return undefined;
      return (JSON.parse(raw) as { meetingLocation?: Location }).meetingLocation;
    } catch {
      return undefined;
    }
  })();

  return {
    room: {
      code,
      meetingId: String(data.meeting.meeting_id),
      name: data.meeting.meeting_name,
      dateTime: data.meeting.meeting_datetime,
      hostName: host?.name ?? "",
      createdAt: data.meeting.created_at,
      meetingLocation,
    },
    members,
    totalCount: members.length,
    locationInputCount: members.filter((m) => m.hasLocation).length,
    preferenceInputCount: members.filter((m) => m.hasPreference).length,
  };
}

export async function joinRoom(params: {
  code: string;
  name: string;
}): Promise<{ memberId: string; member: Member }> {
  const response = await apiClient.post<{
    participantId: string;
    accessToken: string;
    meetingId: string;
  }>("/functions/v1/join-meeting", {
    inviteCode: params.code,
    participantName: params.name,
  });

  const { participantId, accessToken, meetingId } = response.data;
  saveSessionData(params.code, { participantId, accessToken, meetingId });

  const member: Member = {
    id: participantId,
    name: params.name,
    role: "MEMBER",
    isHost: false,
    hasLocation: false,
    hasPreference: false,
    hasVoted: false,
  };

  return { memberId: participantId, member };
}

export async function deleteMember(params: {
  code: string;
  memberId: string;
}): Promise<void> {
  const res = await fetch(
    `/api/rooms/${encodeURIComponent(params.code)}/participants/${params.memberId}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "삭제 실패" }))) as {
      error: string;
    };
    throw new Error(err.error);
  }
}

export async function updateMemberLocation(params: {
  code: string;
  memberId: string;
  location: Location;
}): Promise<Member> {
  const res = await fetch(
    `/api/rooms/${encodeURIComponent(params.code)}/participants/location`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantId: params.memberId,
        label: params.location.label,
        roadAddress: params.location.roadAddress,
        lat: params.location.lat,
        lng: params.location.lng,
      }),
    },
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "위치 저장 실패" }))) as {
      error: string;
    };
    throw new Error(err.error);
  }

  return {
    id: params.memberId,
    name: "",
    role: "MEMBER",
    isHost: false,
    hasLocation: true,
    hasPreference: false,
    hasVoted: false,
    location: params.location,
  };
}
