import { CalendarDays } from "lucide-react";

import type { Slot } from "@/lib/availability";
import { formatBerlin } from "@/lib/time";

export function AvailabilityPreview({ slots }: { slots: Map<string, Slot[]> }) {
  const days = Array.from(slots.entries()).slice(0, 14);

  return (
    <div className="border-line bg-surface shadow-card sticky top-8 h-fit rounded-xl border p-5">
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays className="text-ink-muted size-4" aria-hidden="true" />
        <h2 className="text-ink text-[15px] font-semibold">
          Vorschau: freie Slots
        </h2>
      </div>
      <p className="text-ink-muted mb-4 text-[13px]">
        Aktualisiert sich sofort mit deinen Änderungen — auch bevor du
        speicherst.
      </p>

      {days.length === 0 ? (
        <p className="text-ink-muted text-[14px]">
          Mit den aktuellen Regeln ergeben sich keine freien Slots.
        </p>
      ) : (
        <div className="flex max-h-[520px] flex-col gap-4 overflow-y-auto">
          {days.map(([day, daySlots]) => (
            <div key={day}>
              <p className="text-ink mb-1.5 text-[13px] font-semibold">
                {formatBerlin(`${day}T12:00:00Z`, {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {daySlots.map((slot) => (
                  <span
                    key={slot.start}
                    className="bg-accent-soft text-accent rounded-md px-2 py-1 text-[13px]"
                  >
                    {formatBerlin(slot.start, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
