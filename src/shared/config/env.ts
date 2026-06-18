export const env = {
  API_URL:
    process.env.NEXT_PUBLIC_API_URL ??
    "https://oufchidafmrxgympbcqo.supabase.co/functions/v1",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  NAVER_MAP_CLIENT_ID: process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? "",
} as const;
