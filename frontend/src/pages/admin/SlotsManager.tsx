import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import Button from "../../components/ui/Button";
import { FieldWrapper, Input } from "../../components/ui/Field";
import {
  listBlockedSlots,
  createBlockedSlot,
  deleteBlockedSlot,
} from "../../api/admin";
import type { BlockedSlot } from "../../types";
import { extractErrorMessage } from "../../api/client";
import { formatDate } from "../../utils/format";

const DAILY_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function SlotsManager() {
  const [blocked, setBlocked] = useState<BlockedSlot[] | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState(""); // "" = whole day
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function refresh() {
    listBlockedSlots().then((slots) =>
      setBlocked([...slots].sort((a, b) => a.date.localeCompare(b.date)))
    );
  }

  useEffect(refresh, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!date) {
      setError("Please choose a date to block.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createBlockedSlot({ date, time: time || null, reason });
      setDate("");
      setTime("");
      setReason("");
      refresh();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUnblock(slot: BlockedSlot) {
    await deleteBlockedSlot(slot.id);
    refresh();
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <AdminLayout>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <form onSubmit={handleSubmit} className="rounded-xl border border-line bg-panel p-6">
          <p className="font-display text-xl text-cream">Block a date or time slot</p>
          <p className="mt-1 text-sm text-cream-dim">
            Leave the time empty to block the whole day — useful for holidays or days you're
            already fully booked outside the system.
          </p>

          <div className="mt-5 flex flex-col gap-4">
            <FieldWrapper label="Date">
              <Input type="date" min={today} required value={date} onChange={(e) => setDate(e.target.value)} />
            </FieldWrapper>
            <FieldWrapper label="Time (optional — leave blank to block the full day)">
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-line bg-panel px-4 py-2.5 text-cream focus:border-gold"
              >
                <option value="">Whole day</option>
                {DAILY_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </FieldWrapper>
            <FieldWrapper label="Reason (optional)">
              <Input
                placeholder="e.g. Personal leave, festival, already booked offline"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </FieldWrapper>

            {error && <p className="text-sm text-clay">{error}</p>}

            <Button type="submit" isLoading={isSubmitting}>
              Block slot
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          <p className="font-display text-xl text-cream">Currently blocked</p>
          {blocked === null ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-panel" />
            ))
          ) : blocked.length === 0 ? (
            <p className="text-cream-dim">No dates or slots are blocked right now.</p>
          ) : (
            blocked.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-panel p-4"
              >
                <div>
                  <p className="text-cream">
                    {formatDate(slot.date)}
                    <span className="ml-2 text-gold">{slot.time ? slot.time : "Whole day"}</span>
                  </p>
                  {slot.reason && <p className="text-xs text-cream-dim">{slot.reason}</p>}
                </div>
                <button
                  onClick={() => handleUnblock(slot)}
                  className="rounded-full border border-line px-3 py-1 text-xs text-cream-dim hover:border-gold/50 hover:text-cream"
                >
                  Unblock
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
