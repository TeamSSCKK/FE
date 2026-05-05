export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  KAKAO_MAP_KEY: process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ?? "",
} as const;
