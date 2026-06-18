import axios from "axios";
import { env } from "@/shared/config/env";

// Edge Functions 전용 클라이언트
// 브라우저 → Next.js rewrite(/functions/v1/*) → Supabase (CORS 우회)
export const apiClient = axios.create({
  timeout: 60_000,
  headers: {
    apikey: env.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[apiClient]", error?.response?.status, error?.message);
    }
    return Promise.reject(error);
  },
);
