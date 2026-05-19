"use client";

import { Search, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import { useLocationInputStore } from "../model/store";

interface Props {
  /** 검색 모드 여부. false면 페이드아웃되며 위로 사라진다(언마운트는 하지 않음). */
  visible: boolean;
  onPick: (item: {
    title: string;
    roadAddress: string;
    address: string;
    lat: number;
    lng: number;
  }) => void;
}

export function AddressSearchOverlay({ visible, onPick }: Props) {
  const query = useLocationInputStore((s) => s.query);
  const setQuery = useLocationInputStore((s) => s.setQuery);
  const results = useLocationInputStore((s) => s.results);
  const isSearching = useLocationInputStore((s) => s.isSearching);
  const error = useLocationInputStore((s) => s.error);
  const runSearch = useLocationInputStore((s) => s.runSearch);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void runSearch();
    }, 300);
    return () => window.clearTimeout(id);
  }, [query, runSearch]);

  return (
    <div
      className={cn(
        "absolute inset-x-3 top-3 z-10 space-y-2 transition-all duration-300 ease-out",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-4 opacity-0",
      )}
    >
      <div className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="장소 또는 주소 검색"
          tabIndex={visible ? 0 : -1}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {isSearching && (
          <Loader2
            className="h-4 w-4 animate-spin text-muted-foreground"
            aria-hidden
          />
        )}
      </div>

      {results.length > 0 && (
        <div className="max-h-56 overflow-y-auto rounded-2xl border border-border bg-white shadow-sm">
          {results.map((it, idx) => (
            <button
              key={`${it.title}-${idx}`}
              type="button"
              tabIndex={visible ? 0 : -1}
              onClick={() => onPick(it)}
              className="block w-full border-b border-border/40 px-4 py-3 text-left last:border-b-0 hover:bg-neutral-50"
            >
              <p className="truncate text-sm font-semibold text-gray-900">
                {it.title}
              </p>
              <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                {it.roadAddress || it.address}
              </p>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-white px-3 py-2 text-[12px] text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
