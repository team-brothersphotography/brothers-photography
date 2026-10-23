import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("bp_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Pulls a friendly, displayable message out of a DRF error response.
 * DRF errors can arrive as {detail: "..."} or {field: ["msg", ...]} —
 * this normalizes both into a single string for the UI.
 */

export function extractErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as {
      response?: { data?: { detail?: unknown } };
    }).response;

    const detail = response?.data?.detail;

    if (typeof detail === "string") return detail;

    if (detail && typeof detail === "object") {
      const values = Object.values(detail as Record<string, unknown>);
      const message = values.find((value) => typeof value === "string");

      if (typeof message === "string") return message;
    }
  }

  if (err instanceof Error) return err.message;

  return "Something went wrong. Please try again.";
}

