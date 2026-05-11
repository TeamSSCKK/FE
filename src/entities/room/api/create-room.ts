import type { CreateRoomInput, CreateRoomResult } from "../model/types";
import { generateRoomCode } from "../lib/generate-code";

export async function createRoom(
  input: CreateRoomInput,
): Promise<CreateRoomResult> {
  await new Promise((r) => setTimeout(r, 500));

  const code = generateRoomCode();
  const createdAt = new Date().toISOString();

  // 실제 데이터를 localStorage에 저장
  const roomData = {
    code,
    name: input.name,
    dateTime: input.dateTime,
    hostName: input.hostName,
    password: input.password,
    createdAt,
  };

  localStorage.setItem(`room-${code}`, JSON.stringify(roomData));

  return {
    code,
    createdAt,
  };
}
