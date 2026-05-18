"use client";

import { useLocationInputStore } from "../model/store";

export function SelectedLocationCard() {
  const selected = useLocationInputStore((s) => s.selected);

  // 윗줄(label)과 겹치지 않는 보조 주소를 아랫줄에 표시한다.
  // 검색: label=장소명 → 아랫줄=도로명 주소 / 지도: label=도로명 주소 → 아랫줄=지번 주소
  const sub = selected
    ? selected.roadAddress && selected.roadAddress !== selected.label
      ? selected.roadAddress
      : selected.jibunAddress && selected.jibunAddress !== selected.label
        ? selected.jibunAddress
        : ""
    : "";

  return (
    <div className="rounded-2xl bg-neutral-100 px-5 py-4">
      <p className="text-[12px] text-muted-foreground">선택한 위치</p>
      {selected ? (
        <>
          <p className="mt-1 text-[18px] font-bold text-gray-900">
            {selected.label}
          </p>
          {sub && (
            <p className="mt-0.5 text-[13px] text-muted-foreground">{sub}</p>
          )}
        </>
      ) : (
        <p className="mt-1 text-[14px] text-muted-foreground">
          지도를 움직이거나 주소를 검색해주세요.
        </p>
      )}
    </div>
  );
}
