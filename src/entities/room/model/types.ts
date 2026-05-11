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
  /** 출발지 표시용 위치 라벨 (예: "강남역") */
  locationLabel?: string;
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