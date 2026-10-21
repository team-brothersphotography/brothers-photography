import { apiClient } from "../api/client";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server_session";
  let sessionId = sessionStorage.getItem("bp_session_id");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
    sessionStorage.setItem("bp_session_id", sessionId);
  }
  return sessionId;
}

let lastTrackedEvent: { type: string; page?: string; time: number } | null = null;

export async function trackActivity(
  eventType: string,
  page?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const now = Date.now();
    const currentPage = page || (typeof window !== "undefined" ? window.location.pathname : "/");

    // Throttling duplicate identical events within 1.5 seconds
    if (
      lastTrackedEvent &&
      lastTrackedEvent.type === eventType &&
      lastTrackedEvent.page === currentPage &&
      now - lastTrackedEvent.time < 1500
    ) {
      return;
    }

    lastTrackedEvent = { type: eventType, page: currentPage, time: now };
    const sessionId = getOrCreateSessionId();

    await apiClient.post("/activity/", {
      session_id: sessionId,
      event_type: eventType,
      page: currentPage,
      metadata: metadata || {},
    });
  } catch {
    // Fail silently so tracking calls never block or crash application flows
  }
}
