import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/Badge";
import { listMyBookings } from "../../api/bookings";
import { formatDate, formatTime } from "../../utils/format";
import { extractErrorMessage } from "../../api/client";
import type { Booking } from "../../types";

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    listMyBookings()
      .then(setBookings)
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  return (
    <Layout>
      <section className="mx-auto max-w-4xl px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gold">Account Dashboard</p>
            <h1 className="font-display text-4xl text-cream mt-1">My Bookings</h1>
          </div>
          <Link to="/booking">
            <Button>Book another shoot →</Button>
          </Link>
        </motion.div>

        {error && (
          <div className="mt-8 rounded-xl border border-clay/40 bg-clay/10 p-6 text-center text-clay">
            {error}
          </div>
        )}

        {bookings === null && !error ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-panel" />
            ))}
          </div>
        ) : bookings !== null && bookings.length === 0 && !error ? (
          <div className="mt-8 rounded-2xl border border-line bg-panel p-12 text-center">
            <p className="font-display text-2xl text-cream">No bookings yet</p>
            <p className="mt-2 text-sm text-cream-dim max-w-md mx-auto">
              You haven't scheduled any photography sessions with Brothers Photography yet. Select your date and lock in your shoot now.
            </p>
            <Link to="/booking" className="mt-6 inline-block">
              <Button>Book your first shoot</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {bookings?.map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-2xl border border-line bg-panel p-6 transition-colors hover:border-gold/40"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="font-display text-xl text-cream">{booking.service?.name || "Photography Session"}</h2>
                      <StatusBadge status={booking.status} label={booking.status_display} />
                    </div>
                    <p className="text-sm text-gold-soft font-medium">
                      📅 {formatDate(booking.event_date)} at ⏰ {formatTime(booking.event_time)}
                    </p>
                    <p className="text-xs text-cream-dim">
                      📍 {booking.event_location}
                      {booking.number_of_guests ? ` · 👥 ${booking.number_of_guests} guests` : ""}
                    </p>
                  </div>

                  <div className="flex flex-col items-start sm:items-end justify-between border-t border-line/40 pt-3 sm:border-0 sm:pt-0">
                    <span className="text-xs uppercase tracking-wider text-cream-dim/60">Reference Code</span>
                    <span className="font-mono text-sm font-semibold text-gold">{booking.reference_number}</span>
                    <span className="text-[11px] text-cream-dim/50 mt-1">
                      Booked on {formatDate(booking.created_at.split("T")[0])}
                    </span>
                  </div>
                </div>

                {booking.message && (
                  <div className="mt-4 rounded-xl border border-line/60 bg-panel-soft p-3 text-xs text-cream-dim">
                    <span className="text-cream font-medium">Your Note: </span>
                    {booking.message}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
