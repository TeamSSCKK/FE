import type { CreateRoomInput, CreateRoomResult } from "../model/types";
import { generateRoomCode } from "../lib/generate-code";

export async function createRoom(
  _input: CreateRoomInput,
): Promise<CreateRoomResult> {
  await new Promise((r) => setTimeout(r, 500));
  return {
    code: generateRoomCode(),
    createdAt: new Date().toISOString(),
  };
}
