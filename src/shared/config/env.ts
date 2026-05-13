export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  NAVER_MAP_CLIENT_ID: process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? "",
} as const;
