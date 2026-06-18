export type RoomCode = string;

export interface CreateRoomInput {
  name: string;
  dateTime: string;
  hostName: string;
}

export interface CreateRoomResult {
  code: RoomCode;
  meetingId: string;
}

export interface Room {
  code: RoomCode;
  meetingId: string;
  name: string;
  dateTime: string;
  hostName: string;
  createdAt: string;
  /** 호스트가 큐레이션 단계에서 정한 모임 장소 (미설정 시 undefined) */
  meetingLocation?: Location;
  /** 최종 확정된 모임 식당 (final_decision 기반, 미확정 시 undefined) */
  selectedRestaurant?: SelectedRestaurant;
}

/** 모임 메인 화면 하단에 표출할 확정 식당 정보 */
export interface SelectedRestaurant {
  id: string;
  name: string;
  category?: string;
  address?: string;
  /** 적합도 (0~100) */
  fitScore?: number;
  /** 모임 장소로부터의 도보 환산 시간(분) */
  travelTimeMinutes?: number;
}

export interface Location {
  label: string;
  roadAddress: string;
  jibunAddress?: string;
  lat: number;
  lng: number;
}

export type PreferenceTone = "like" | "dislike";

export interface PreferenceTagInput {
  id: string;
  label: string;
  tone: PreferenceTone;
}

export interface RestrictionTagInput {
  id: string;
  label: string;
}

export interface MemberPreference {
  tags: PreferenceTagInput[];
  restrictions: RestrictionTagInput[];
}

export interface Member {
  id: string;
  name: string;
  role: "HOST" | "MEMBER";
  isHost: boolean;
  hasLocation: boolean;
  hasPreference: boolean;
  hasVoted: boolean;
  /** @deprecated `location.label` 사용 */
  locationLabel?: string;
  location?: Location;
  preference?: MemberPreference;
}

export interface RoomStatus {
  room: Room;
  members: Member[];
  totalCount: number;
  locationInputCount: number;
  preferenceInputCount: number;
}
