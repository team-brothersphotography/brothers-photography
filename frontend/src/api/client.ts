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
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (!data) return "Something went wrong. Please try again.";
    if (typeof data === "string") return data;
    if (data.detail) return String(data.detail);

    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const value = data[firstKey];
      const message = Array.isArray(value) ? value[0] : value;
      return String(message);
    }
  }
  return "Something went wrong. Please try again.";
}
