import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/Badge";
import { listMyBookings } from "../../api/bookings";
import { useAuth } from "../../context/AuthContext";
import { formatDate, formatTime } from "../../utils/format";
import type { Booking } from "../../types";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    listMyBookings().then(setBookings);
  }, []);

  return (
    <Layout>
      <section className="mx-auto max-w-4xl px-6 py-14">
        <p className="text-sm uppercase tracking-[0.2em] text-gold">My account</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl text-cream">Hi, {user?.full_name?.split(" ")[0]}</h1>
          <Link to="/book">
            <Button>Book another shoot</Button>
          </Link>
        </div>

        <div className="mt-6 rounded-xl border border-line bg-panel p-5 text-sm text-cream-dim">
          <p>
            <span className="text-cream-dim/70">Email: </span>
            <span className="text-cream">{user?.email}</span>
          </p>
          <p className="mt-1">
            <span className="text-cream-dim/70">Phone: </span>
            <span className="text-cream">{user?.phone_number || "—"}</span>
          </p>
        </div>

        <p className="mt-12 font-display text-2xl text-cream">My bookings</p>

        {bookings === null ? (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-panel" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-6 rounded-xl border border-line bg-panel p-8 text-center">
            <p className="text-cream-dim">You haven't made any bookings yet.</p>
            <Link to="/book" className="mt-4 inline-block">
              <Button variant="outline">Book your first shoot</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col gap-3 rounded-xl border border-line bg-panel p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-cream">{booking.service.name}</p>
                  <p className="mt-1 text-sm text-cream-dim">
                    {formatDate(booking.event_date)} · {formatTime(booking.event_time)}
                  </p>
                  <p className="mt-1 text-xs text-cream-dim/60">Ref: {booking.reference_number}</p>
                </div>
                <StatusBadge status={booking.status} label={booking.status_display} />
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
