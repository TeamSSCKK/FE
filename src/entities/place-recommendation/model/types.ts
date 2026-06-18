export interface MemberTravel {
  memberId: string;
  memberName: string;
  minutes: number;
}

export interface RecommendedPlace {
  id: string;
  name: string;
  category: string;
  address?: string;
  lat: number;
  lng: number;
  memberTravels: MemberTravel[];
  averageMinutes: number;
  maxMinutes?: number;
  standardDeviation?: number;
  fairnessScore?: number;
  rank?: number;
}

export interface MemberOrigin {
  memberId: string;
  memberName: string;
  lat: number;
  lng: number;
}

export interface PlaceRecommendationResult {
  calculationMethod?: string;
  places: RecommendedPlace[];
  origins: MemberOrigin[];
}
