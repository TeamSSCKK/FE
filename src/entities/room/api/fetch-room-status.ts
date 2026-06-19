import axios from "axios";
import { apiClient } from "@/shared/api/axios-instance";
import { saveSessionData } from "@/shared/lib/room-session";
import type {
  RoomStatus,
  Member,
  Location,
  SelectedRestaurant,
} from "../model/types";

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

interface SupabaseFinalRestaurant {
  restaurant_candidate_id: number;
  restaurant_name: string;
  category: string | null;
  address: string | null;
  preference_score: number | null;
  distance_meters: number | null;
}

export async function fetchRoomStatus(code: string): Promise<RoomStatus> {
  const res = await fetch(`/api/rooms/${encodeURIComponent(code)}`, {
    cache: "no-store",
  });
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
    finalRestaurant: SupabaseFinalRestaurant | null;
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
      hasRestaurantVoted: p.restaurant_vote_yn,
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

  // 백엔드 final_decision 기반 확정 식당 매핑 (도보 분속 ~78m/분 근사)
  const fr = data.finalRestaurant;
  const selectedRestaurant: SelectedRestaurant | undefined = fr
    ? {
        id: String(fr.restaurant_candidate_id),
        name: fr.restaurant_name,
        category: fr.category ?? undefined,
        address: fr.address ?? undefined,
        fitScore:
          fr.preference_score != null
            ? Math.min(100, Math.max(0, Math.round(fr.preference_score)))
            : undefined,
        travelTimeMinutes:
          fr.distance_meters != null
            ? Math.round(fr.distance_meters / 78)
            : undefined,
      }
    : undefined;

  return {
    room: {
      code,
      meetingId: String(data.meeting.meeting_id),
      name: data.meeting.meeting_name,
      dateTime: data.meeting.meeting_datetime,
      hostName: host?.name ?? "",
      createdAt: data.meeting.created_at,
      status: data.meeting.status,
      meetingLocation,
      selectedRestaurant,
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
  let response;
  try {
    response = await apiClient.post<{
      participantId: number | string;
      accessToken: string;
      meetingId: number | string;
    }>("/functions/v1/join-meeting", {
      inviteCode: params.code,
      participantName: params.name,
    });
  } catch (e) {
    // 백엔드는 (meeting_id, participant_name) unique 위반을 500으로 던진다.
    // join 단계에서 가장 흔한 실패가 동명이인이므로 안내 메시지로 변환한다.
    if (axios.isAxiosError(e)) {
      const status = e.response?.status;
      if (status === 500) {
        throw new Error(
          "이미 같은 이름의 참가자가 있어요. 다른 이름으로 참가해주세요.",
        );
      }
      if (status === 409) {
        throw new Error("지금은 참여할 수 없는 모임이에요.");
      }
      if (status === 404) {
        throw new Error("모임을 찾을 수 없어요. 링크를 다시 확인해주세요.");
      }
    }
    throw new Error("참여에 실패했어요. 잠시 후 다시 시도해주세요.");
  }

  // 백엔드는 id를 숫자로 내려주므로 즉시 문자열로 정규화한다.
  const participantId = String(response.data.participantId);
  const meetingId = String(response.data.meetingId);
  const { accessToken } = response.data;
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
