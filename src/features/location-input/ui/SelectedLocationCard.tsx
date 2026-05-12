"use client";

import { useLocationInputStore } from "../model/store";

export function SelectedLocationCard() {
  const selected = useLocationInputStore((s) => s.selected);

  return (
    <div className="rounded-2xl bg-neutral-100 px-5 py-4">
      <p className="text-[12px] text-muted-foreground">선택한 위치</p>
      {selected ? (
        <>
          <p className="mt-1 text-[18px] font-bold text-gray-900">
            {selected.label}
          </p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {selected.roadAddress || selected.jibunAddress || ""}
          </p>
        </>
      ) : (
        <p className="mt-1 text-[14px] text-muted-foreground">
          지도를 움직이거나 주소를 검색해주세요.
        </p>
      )}
    </div>
  );
}
