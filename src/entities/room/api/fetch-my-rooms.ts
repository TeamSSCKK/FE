import { fetchRoomStatus } from "./fetch-room-status";
import { getJoinedCodes, removeJoinedCode } from "../lib/joined-rooms-storage";
import type { RoomStatus } from "../model/types";

// TODO: 백엔드 연동 시 GET /rooms/mine 한 줄로 교체
export async function fetchMyRooms(): Promise<RoomStatus[]> {
  const codes = getJoinedCodes();
  if (codes.length === 0) return [];

  const settled = await Promise.allSettled(codes.map((c) => fetchRoomStatus(c)));

  const results: RoomStatus[] = [];
  settled.forEach((r, idx) => {
    if (r.status === "fulfilled") {
      results.push(r.value);
    } else {
      removeJoinedCode(codes[idx]);
    }
  });

  return results.sort(
    (a, b) => new Date(b.room.createdAt).getTime() - new Date(a.room.createdAt).getTime(),
  );
}
