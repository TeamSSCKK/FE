import { create } from "zustand";
import { searchPlaces } from "../api/search-places";
import type {
  LocationInputMode,
  PlaceSearchItem,
  SelectedLocation,
} from "./types";

interface LocationInputState {
  mode: LocationInputMode;
  selected: SelectedLocation | null;
  query: string;
  results: PlaceSearchItem[];
  isSearching: boolean;
  isSubmitting: boolean;
  error: string | null;
  setMode: (mode: LocationInputMode) => void;
  setSelected: (selected: SelectedLocation | null) => void;
  setQuery: (query: string) => void;
  setIsSubmitting: (v: boolean) => void;
  setError: (msg: string | null) => void;
  clearResults: () => void;
  runSearch: () => Promise<void>;
  reset: () => void;
}

export const useLocationInputStore = create<LocationInputState>((set, get) => ({
  mode: "map",
  selected: null,
  query: "",
  results: [],
  isSearching: false,
  isSubmitting: false,
  error: null,
  setMode: (mode) => set({ mode }),
  setSelected: (selected) => set({ selected }),
  setQuery: (query) => set({ query }),
  setIsSubmitting: (v) => set({ isSubmitting: v }),
  setError: (msg) => set({ error: msg }),
  clearResults: () => set({ results: [] }),
  runSearch: async () => {
    const q = get().query.trim();
    if (!q) {
      set({ results: [], isSearching: false });
      return;
    }
    set({ isSearching: true, error: null });
    try {
      const items = await searchPlaces(q);
      set({ results: items, isSearching: false });
    } catch (e) {
      set({
        results: [],
        isSearching: false,
        error: e instanceof Error ? e.message : "검색 실패",
      });
    }
  },
  reset: () =>
    set({
      mode: "map",
      selected: null,
      query: "",
      results: [],
      isSearching: false,
      isSubmitting: false,
      error: null,
    }),
}));
