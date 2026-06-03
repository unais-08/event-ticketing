import axios from "axios";
import { useAuthStore } from "@/app/_stores/auth-store";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  let token = useAuthStore.getState().token;

  if (!token && typeof window !== "undefined") {
    token = localStorage.getItem("eventflow_token");
  }

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().clearSession();
    }

    return Promise.reject(error);
  },
);
