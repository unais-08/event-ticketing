import axios from "axios";
import type { ApiResponse } from "./types";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const response = error.response?.data as ApiResponse<unknown> | undefined;
    return response?.message ?? fallback;
  }

  return fallback;
}
