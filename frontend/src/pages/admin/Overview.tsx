import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { getDashboardStats } from "../../api/admin";
import type { DashboardStats } from "../../types";

const CARDS: { key: keyof DashboardStats; label: string }[] = [
  { key: "total_bookings", label: "Total bookings" },
  { key: "pending_bookings", label: "Pending" },
  { key: "confirmed_bookings", label: "Confirmed" },
  { key: "upcoming_bookings", label: "Upcoming" },
  { key: "completed_bookings", label: "Completed" },
  { key: "cancelled_bookings", label: "Cancelled" },
  { key: "active_services", label: "Active services" },
];

export default function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  return (
    <AdminLayout>
      {stats === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-panel" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <div key={card.key} className="rounded-xl border border-line bg-panel p-5">
              <p className="text-sm text-cream-dim">{card.label}</p>
              <p className="mt-2 font-display text-3xl text-gold">{stats[card.key]}</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
