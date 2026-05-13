export type LocationInputMode = "map" | "search";

export interface PlaceSearchItem {
  title: string;
  roadAddress: string;
  address: string;
  category?: string;
  lat: number;
  lng: number;
}

export interface SelectedLocation {
  label: string;
  roadAddress: string;
  jibunAddress?: string;
  coords: { lat: number; lng: number };
}
