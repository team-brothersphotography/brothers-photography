import type { BookingStatus } from "../../types";

const statusStyles: Record<BookingStatus, string> = {
  pending: "bg-gold/15 text-gold-soft border-gold/40",
  confirmed: "bg-moss/15 text-moss border-moss/40",
  completed: "bg-cream/10 text-cream border-cream/30",
  cancelled: "bg-clay/15 text-clay border-clay/40",
};

export default function StatusBadge({ status, label }: { status: BookingStatus; label: string }) {
  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-xs tracking-wide ${statusStyles[status]}`}>
      {label}
    </span>
  );
}
