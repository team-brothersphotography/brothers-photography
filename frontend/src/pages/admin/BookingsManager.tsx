import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import StatusBadge from "../../components/ui/Badge";
import { listAllBookings, updateBookingStatus } from "../../api/admin";
import { extractErrorMessage } from "../../api/client";
import { formatDate, formatTime } from "../../utils/format";
import type { Booking, BookingStatus } from "../../types";

const FILTERS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const NEXT_ACTIONS: Record<BookingStatus, { label: string; next: BookingStatus }[]> = {
  pending: [
    { label: "Confirm", next: "confirmed" },
    { label: "Cancel", next: "cancelled" },
  ],
  confirmed: [
    { label: "Mark completed", next: "completed" },
    { label: "Cancel", next: "cancelled" },
  ],
  completed: [],
  cancelled: [],
};

export default function BookingsManager() {
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    setBookings(null);
    listAllBookings(filter === "all" ? undefined : filter).then(setBookings);
  }, [filter]);

  async function handleStatusChange(booking: Booking, next: BookingStatus) {
    setError("");
    setUpdatingId(booking.id);
    try {
      const updated = await updateBookingStatus(booking.id, next);
      setBookings((prev) => prev?.map((b) => (b.id === booking.id ? updated : b)) ?? null);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              filter === f.value
                ? "border-gold bg-gold text-ink"
                : "border-line text-cream-dim hover:border-gold/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-clay">{error}</p>}

      {bookings === null ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-panel" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <p className="mt-8 text-cream-dim">No bookings in this view yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-xl border border-line bg-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-cream-dim/60">{booking.reference_number}</p>
                  <p className="mt-1 text-cream">
                    {booking.full_name} — {booking.service.name}
                  </p>
                  <p className="mt-1 text-sm text-cream-dim">
                    {formatDate(booking.event_date)} · {formatTime(booking.event_time)} ·{" "}
                    {booking.event_location}
                  </p>
                  <p className="mt-1 text-sm text-cream-dim">{booking.phone_number}</p>
                  {booking.number_of_guests != null && (
                    <p className="mt-1 text-sm text-cream-dim">Guests: {booking.number_of_guests}</p>
                  )}
                  {booking.message && (
                    <p className="mt-2 max-w-md text-sm text-cream-dim/80">"{booking.message}"</p>
                  )}
                </div>
                <StatusBadge status={booking.status} label={booking.status_display} />
              </div>

              {NEXT_ACTIONS[booking.status].length > 0 && (
                <div className="mt-4 flex gap-2 border-t border-line/60 pt-4">
                  {NEXT_ACTIONS[booking.status].map((action) => (
                    <button
                      key={action.next}
                      disabled={updatingId === booking.id}
                      onClick={() => handleStatusChange(booking, action.next)}
                      className="rounded-full border border-gold/50 px-4 py-1.5 text-xs text-gold transition-colors hover:bg-gold hover:text-ink disabled:opacity-50"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
