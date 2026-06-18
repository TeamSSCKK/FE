import axios from "axios";
import { env } from "@/shared/config/env";

export const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: 60_000,
  withCredentials: false,
  headers: env.SUPABASE_ANON_KEY
    ? {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      }
    : undefined,
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
