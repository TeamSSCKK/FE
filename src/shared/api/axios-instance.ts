import axios from "axios";
import { env } from "@/shared/config/env";

export const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: 10_000,
  withCredentials: true,
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
