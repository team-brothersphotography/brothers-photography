import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";

interface CalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function Calendar({ selectedDate, onSelect }: CalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(selectedDate || new Date());
  const today = startOfDay(new Date());

  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const leadingBlanks = getDay(monthStart);

  return (
    <div className="rounded-2xl border border-line bg-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setVisibleMonth((m) => subMonths(m, 1))}
          aria-label="Previous month"
          className="rounded-full p-1.5 text-cream-dim hover:bg-panel-soft hover:text-cream"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="font-display text-lg text-cream">{format(visibleMonth, "MMMM yyyy")}</p>
        <button
          type="button"
          onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
          aria-label="Next month"
          className="rounded-full p-1.5 text-cream-dim hover:bg-panel-soft hover:text-cream"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-cream-dim/70">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const isPast = isBefore(day, today);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const inMonth = isSameMonth(day, visibleMonth);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => onSelect(day)}
              className={`aspect-square rounded-lg text-sm transition-colors ${
                !inMonth ? "text-cream-dim/30" : ""
              } ${
                isSelected
                  ? "bg-gold text-ink font-semibold"
                  : isPast
                    ? "cursor-not-allowed text-cream-dim/30"
                    : "text-cream hover:bg-panel-soft"
              }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
