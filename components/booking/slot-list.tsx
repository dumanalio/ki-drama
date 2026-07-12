import { CalendarX } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { formatBerlin } from "@/lib/time";
import type { Slot } from "@/lib/availability";

export interface SlotListProps {
  slots: Slot[];
  selectedStart: string | null;
  onSelectSlot: (slot: Slot) => void;
}

export function SlotList({
  slots,
  selectedStart,
  onSelectSlot,
}: SlotListProps) {
  if (slots.length === 0) {
    return (
      <EmptyState
        icon={CalendarX}
        title="Keine freien Termine an diesem Tag"
        description="Wähle einen anderen Tag im Kalender."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((slot) => (
        <button
          key={slot.start}
          type="button"
          onClick={() => onSelectSlot(slot)}
          className={cn(
            "border-line h-11 rounded-lg border text-[15px] font-medium transition-colors duration-[120ms]",
            selectedStart === slot.start
              ? "border-accent bg-accent text-white"
              : "text-ink hover:border-line-strong"
          )}
        >
          {formatBerlin(slot.start, { hour: "2-digit", minute: "2-digit" })}
        </button>
      ))}
    </div>
  );
}
