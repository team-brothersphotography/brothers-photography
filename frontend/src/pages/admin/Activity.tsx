import { useEffect, useState, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import Button from "../../components/ui/Button";
import { apiClient, extractErrorMessage } from "../../api/client";
import { formatDate } from "../../utils/format";

export interface ActivityItem {
  id: number;
  user_id: number | null;
  session_id: string;
  event_type: string;
  page: string | null;
  timestamp: string;
  metadata_json: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
}

export interface ActivityPaginatedResponse {
  items: ActivityItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const EVENT_TYPES = [
  "ALL",
  "SESSION_START",
  "LOGIN",
  "LOGOUT",
  "PAGE_VIEW",
  "SERVICE_VIEW",
  "GALLERY_VIEW",
  "PHOTO_VIEW",
  "BOOKING_STARTED",
  "BOOKING_SUBMITTED",
  "CAMERA_OPENED",
  "PHOTO_CAPTURED",
  "PHOTO_UPLOADED",
  "PROFILE_VIEWED",
  "PROFILE_UPDATED",
];

export default function Activity() {
  const [data, setData] = useState<ActivityPaginatedResponse | null>(null);
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState("ALL");
  const [pageFilter, setPageFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params: Record<string, string | number> = {
        page,
        limit: 15,
      };
      if (eventType !== "ALL") params.event_type = eventType;
      if (pageFilter.trim()) params.page_filter = pageFilter.trim();

      const res = await apiClient.get<ActivityPaginatedResponse>("/admin/activity/", { params });
      setData(res.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, eventType, pageFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function getBadgeClass(type: string) {
    if (type.includes("BOOKING")) return "border-gold/50 bg-gold/10 text-gold";
    if (type.includes("LOGIN") || type.includes("PROFILE")) return "border-moss/50 bg-moss/10 text-moss";
    if (type.includes("CAMERA") || type.includes("PHOTO")) return "border-cream-dim/50 bg-cream-dim/10 text-cream";
    return "border-line bg-panel-soft text-cream-dim";
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-cream">Activity & Audit Log</h2>
            <p className="text-sm text-cream-dim mt-1">
              Real database-backed audit log tracking studio operations and user events.
            </p>
          </div>
          <Button variant="outline" onClick={() => fetchLogs()} isLoading={isLoading}>
            🔄 Refresh Logs
          </Button>
        </div>

        {/* Filters Bar */}
        <div className="rounded-2xl border border-line bg-panel p-5 grid gap-4 sm:grid-cols-12">
          <div className="sm:col-span-6 md:col-span-4">
            <label className="block text-xs uppercase tracking-wider text-cream-dim mb-1 font-medium">
              Filter by Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-line bg-panel-soft px-3 py-2 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-gold"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "ALL" ? "All Events" : t}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-6 md:col-span-5">
            <label className="block text-xs uppercase tracking-wider text-cream-dim mb-1 font-medium">
              Filter by Page Path
            </label>
            <input
              type="text"
              value={pageFilter}
              onChange={(e) => {
                setPageFilter(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. /gallery or /booking"
              className="w-full rounded-xl border border-line bg-panel-soft px-3 py-2 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
        </div>

        {/* State Messages */}
        {error && (
          <div className="rounded-xl border border-clay/40 bg-clay/10 p-6 text-center text-clay text-sm">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-panel" />
            ))}
          </div>
        )}

        {/* Log Table / List */}
        {!isLoading && !error && data && (
          <>
            {data.items.length === 0 ? (
              <div className="rounded-2xl border border-line bg-panel p-10 text-center text-cream-dim">
                No activity logs match the selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-line bg-panel">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-line/60 bg-panel-soft text-xs uppercase tracking-wider text-cream-dim">
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Event Type</th>
                      <th className="p-4">User</th>
                      <th className="p-4">Page / Location</th>
                      <th className="p-4">Session ID</th>
                      <th className="p-4">Metadata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {data.items.map((log) => (
                      <tr key={log.id} className="hover:bg-panel-soft/50 transition-colors">
                        <td className="p-4 text-xs font-mono text-cream whitespace-nowrap">
                          {formatDate(log.timestamp.split("T")[0])} {log.timestamp.split("T")[1]?.substring(0, 8)}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-medium ${getBadgeClass(
                              log.event_type
                            )}`}
                          >
                            {log.event_type}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-cream font-medium">
                          {log.user_id ? `User #${log.user_id}` : <span className="text-cream-dim/60">Guest</span>}
                        </td>
                        <td className="p-4 text-xs text-gold font-mono">{log.page || "—"}</td>
                        <td className="p-4 text-[11px] text-cream-dim font-mono truncate max-w-[120px]">
                          {log.session_id}
                        </td>
                        <td className="p-4 text-xs text-cream-dim font-mono max-w-[200px] truncate">
                          {Object.keys(log.metadata_json).length > 0
                            ? JSON.stringify(log.metadata_json)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {data.total_pages > 1 && (
              <div className="flex items-center justify-between border-t border-line/60 pt-4 text-sm text-cream-dim">
                <span>
                  Showing page <strong className="text-cream">{data.page}</strong> of{" "}
                  <strong className="text-cream">{data.total_pages}</strong> ({data.total} total logs)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={data.page <= 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  >
                    ← Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={data.page >= data.total_pages}
                    onClick={() => setPage((p) => Math.min(p + 1, data.total_pages))}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
