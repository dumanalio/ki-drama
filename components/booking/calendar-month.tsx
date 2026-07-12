"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { getBerlinDateString } from "@/lib/time";

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTH_LABELS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

function buildMonthGrid(year: number, month: number): (string | null)[][] {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const startWeekday = (firstOfMonth.getUTCDay() + 6) % 7; // Mo=0..So=6
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: (string | null)[] = Array(startWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    );
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export interface CalendarMonthProps {
  availableDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function CalendarMonth({
  availableDates,
  selectedDate,
  onSelectDate,
}: CalendarMonthProps) {
  const todayStr = getBerlinDateString(new Date());
  const [todayYear, todayMonth] = todayStr.split("-").map(Number);
  const [viewYear, setViewYear] = React.useState(todayYear);
  const [viewMonth, setViewMonth] = React.useState(todayMonth);

  const weeks = React.useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth]
  );
  const isAtCurrentMonth = viewYear === todayYear && viewMonth === todayMonth;

  function goToPrevMonth() {
    if (isAtCurrentMonth) return;
    setViewMonth((month) => {
      if (month === 1) {
        setViewYear((year) => year - 1);
        return 12;
      }
      return month - 1;
    });
  }

  function goToNextMonth() {
    setViewMonth((month) => {
      if (month === 12) {
        setViewYear((year) => year + 1);
        return 1;
      }
      return month + 1;
    });
  }

  return (
    <div className="border-line bg-surface shadow-card rounded-xl border p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevMonth}
          disabled={isAtCurrentMonth}
          aria-label="Vorheriger Monat"
          className="text-ink-muted hover:text-ink flex size-9 items-center justify-center rounded-lg transition-colors duration-[120ms] disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <span className="text-ink text-[16px] font-semibold">
          {MONTH_LABELS[viewMonth - 1]} {viewYear}
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Nächster Monat"
          className="text-ink-muted hover:text-ink flex size-9 items-center justify-center rounded-lg transition-colors duration-[120ms]"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="text-ink-muted mb-2 grid grid-cols-7 gap-1 text-center text-[12px] font-medium">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((dateStr, index) => {
          if (!dateStr) return <span key={`empty-${index}`} />;

          const available = availableDates.has(dateStr);
          const isPast = dateStr < todayStr;
          const disabled = !available || isPast;
          const selected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(dateStr)}
              aria-current={selected ? "date" : undefined}
              className={cn(
                "aspect-square rounded-lg text-[14px] transition-colors duration-[120ms]",
                disabled
                  ? "text-ink-muted/40 cursor-not-allowed"
                  : "text-ink hover:bg-accent-soft cursor-pointer",
                selected && "bg-accent hover:bg-accent-hover text-white"
              )}
            >
              {Number(dateStr.split("-")[2])}
            </button>
          );
        })}
      </div>
    </div>
  );
}
