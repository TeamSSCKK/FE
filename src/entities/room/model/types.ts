export type RoomCode = string;

export interface CreateRoomInput {
  name: string;
  dateTime: string;
  hostName: string;
  password: string;
}

export interface CreateRoomResult {
  code: RoomCode;
  createdAt: string;
}

export interface Room {
  code: RoomCode;
  name: string;
  dateTime: string;
  hostName: string;
  createdAt: string;
  /** 호스트가 큐레이션 단계에서 확정한 모임 장소 */
  meetingLocation?: Location;
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

/**
 * 출발지(좌표 + 주소) 정보
 */
export interface Location {
  /** 표시용 장소명 (예: "강남역", "중앙대학교") */
  label: string;
  /** 도로명 주소 */
  roadAddress: string;
  /** 지번 주소 (옵션) */
  jibunAddress?: string;
  /** 위도 */
  lat: number;
  /** 경도 */
  lng: number;
}

/**
 * 방 멤버 정보
 */
export interface Member {
  /** 멤버 ID */
  id: string;
  /** 멤버 이름 */
  name: string;
  /** 주최자 여부 */
  isHost: boolean;
  /** 위치 입력 완료 여부 */
  hasLocation: boolean;
  /** 음식 취향 입력 완료 여부 */
  hasPreference: boolean;
  /** 투표 완료 여부 */
  hasVoted: boolean;
  /** @deprecated `location.label` 사용 — 호환을 위해 임시 유지 */
  locationLabel?: string;
  /** 본인이 입력한 출발지 (좌표 + 주소) */
  location?: Location;
  /** 본인이 입력한 음식 취향(선호/비선호/제한) */
  preference?: MemberPreference;
}

/**
 * 방 상태 정보
 */
export interface RoomStatus {
  /** 방 정보 */
  room: Room;
  /** 멤버 목록 */
  members: Member[];
  /** 총 멤버 수 */
  totalCount: number;
  /** 위치 입력한 멤버 수 */
  locationInputCount: number;
  /** 취향 입력한 멤버 수 */
  preferenceInputCount: number;
 
}