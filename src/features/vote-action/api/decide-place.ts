/**
 * 위치 투표 결과를 확정 장소로 기록한다.
 *
 * close-vote(PLACE)는 모임 상태를 LOCATION_DECIDED로 바꿔 이후 식당 추천을 막으므로,
 * 식당 추천까지 이어지는 흐름에서는 이 함수로 final_decision만 기록하고 상태는 PLACE_VOTING으로 둔다.
 */
export async function decidePlace(params: {
  code: string;
  placeCandidateId: string;
}): Promise<void> {
  const res = await fetch(
    `/api/rooms/${encodeURIComponent(params.code)}/decide-place`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeCandidateId: params.placeCandidateId }),
    },
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: "확정 실패" }))) as {
      error: string;
    };
    throw new Error(err.error ?? "확정에 실패했어요.");
  }
}
