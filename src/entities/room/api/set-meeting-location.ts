import type { Location } from "../model/types";

export interface SetMeetingLocationInput {
  code: string;
  location: Location;
}

export async function setMeetingLocation(
  input: SetMeetingLocationInput,
): Promise<void> {
  if (typeof window === "undefined") throw new Error("No window");
  const key = `room-${input.code}`;
  const raw = localStorage.getItem(key);
  if (!raw) throw new Error("Room not found");
  const room = JSON.parse(raw);
  room.meetingLocation = input.location;
  localStorage.setItem(key, JSON.stringify(room));
  await new Promise((r) => setTimeout(r, 150));
}
