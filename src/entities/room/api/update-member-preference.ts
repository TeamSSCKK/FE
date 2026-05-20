import type { MemberPreference } from "../model/types";
import { readMembers, writeMembers } from "./fetch-room-status";

export interface UpdateMemberPreferenceInput {
  code: string;
  memberId: string;
  preference: MemberPreference;
}

export async function updateMemberPreference(
  input: UpdateMemberPreferenceInput,
): Promise<void> {
  const members = readMembers(input.code);
  if (!members) throw new Error("Room not found");
  const target = members.find((m) => m.id === input.memberId);
  if (!target) throw new Error("Member not found");

  target.preference = input.preference;
  target.hasPreference = true;
  writeMembers(input.code, members);

  await new Promise((r) => setTimeout(r, 200));
}
