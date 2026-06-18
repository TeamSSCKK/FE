import type { MemberPreference } from "../model/types";

export interface UpdateMemberPreferenceInput {
  code: string;
  memberId: string;
  preference: MemberPreference;
}

export async function updateMemberPreference(
  input: UpdateMemberPreferenceInput,
): Promise<void> {
  const rows = [
    ...input.preference.tags.map((t) => ({
      preference_type: t.tone === "like" ? "LIKE" : "DISLIKE",
      preference_value: t.label,
    })),
    ...input.preference.restrictions.map((r) => ({
      preference_type: "RESTRICTION",
      preference_value: r.label,
    })),
  ];

  const res = await fetch(
    `/api/rooms/${encodeURIComponent(input.code)}/participants/preference`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: input.memberId, rows }),
    },
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "취향 저장 실패" }))) as {
      error: string;
    };
    throw new Error(err.error);
  }
}
