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
