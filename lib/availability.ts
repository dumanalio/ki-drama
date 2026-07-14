import { getBerlinDateString, toUtc } from "@/lib/time";
import type { AvailabilityException, AvailabilityRule } from "@/types/database";

export interface BookedRange {
  startsAt: string;
  endsAt: string;
}

export interface AvailabilitySettings {
  slotMinutes: number;
  leadTimeHours: number;
  horizonDays: number;
}

export interface Slot {
  start: string;
  end: string;
}

export interface ComputeAvailabilityInput {
  rules: AvailabilityRule[];
  exceptions: AvailabilityException[];
  bookedRanges: BookedRange[];
  settings: AvailabilitySettings;
  /** Für Tests: der als "jetzt" angenommene Zeitpunkt. Standard: new Date(). */
  now?: Date;
}

interface Window {
  startTime: string;
  endTime: string;
  slotMinutes: number;
  bufferMinutes: number;
}

/** Reine Kalenderarithmetik auf einem YYYY-MM-DD-String, keine Zeitzonen-Logik. */
function addDays(dateString: string, days: number): string {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

/** Wochentag eines Kalendertags (0=Sonntag..6=Samstag) — reine Kalenderarithmetik. */
function weekdayOf(dateString: string): number {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/**
 * Berechnet freie Slots aus Wochenregeln, Ausnahmen und bereits gebuchten
 * Zeiträumen. Reine Funktion: keine Datenbankzugriffe, keine Seiteneffekte.
 * Alle Zeitzonen-Umrechnungen laufen über lib/time.ts.
 */
export function computeAvailability(
  input: ComputeAvailabilityInput
): Map<string, Slot[]> {
  const now = input.now ?? new Date();
  const earliestStartMs =
    now.getTime() + input.settings.leadTimeHours * 3_600_000;
  const horizonEndMs = now.getTime() + input.settings.horizonDays * 86_400_000;

  const exceptionsByDay = new Map<string, AvailabilityException[]>();
  for (const exception of input.exceptions) {
    const list = exceptionsByDay.get(exception.day) ?? [];
    list.push(exception);
    exceptionsByDay.set(exception.day, list);
  }

  const rulesByWeekday = new Map<number, AvailabilityRule[]>();
  for (const rule of input.rules) {
    if (!rule.active) continue;
    const list = rulesByWeekday.get(rule.weekday) ?? [];
    list.push(rule);
    rulesByWeekday.set(rule.weekday, list);
  }

  const bookedRanges = input.bookedRanges.map((booking) => ({
    start: new Date(booking.startsAt).getTime(),
    end: new Date(booking.endsAt).getTime(),
  }));

  const result = new Map<string, Slot[]>();
  let cursorDay = getBerlinDateString(now);

  // Harte Obergrenze als Sicherheitsnetz gegen Endlosschleifen bei
  // unerwarteten Eingaben — der eigentliche Abbruch ist die horizonEndMs-Prüfung.
  for (let i = 0; i < input.settings.horizonDays + 2; i++) {
    const dayStart = toUtc(`${cursorDay}T00:00:00`);
    if (dayStart.getTime() > horizonEndMs) break;

    const dayExceptions = exceptionsByDay.get(cursorDay) ?? [];
    const blockedAllDay = dayExceptions.some((exception) => exception.blocked);

    const windows: Window[] = [];

    if (!blockedAllDay) {
      const rules = rulesByWeekday.get(weekdayOf(cursorDay)) ?? [];
      for (const rule of rules) {
        windows.push({
          startTime: rule.start_time,
          endTime: rule.end_time,
          slotMinutes: rule.slot_minutes,
          bufferMinutes: rule.buffer_minutes,
        });
      }
      for (const exception of dayExceptions) {
        if (!exception.blocked && exception.start_time && exception.end_time) {
          windows.push({
            startTime: exception.start_time,
            endTime: exception.end_time,
            slotMinutes: input.settings.slotMinutes,
            bufferMinutes: 0,
          });
        }
      }
    }

    const daySlots: Slot[] = [];
    // Überlappende Regeln (z. B. zwei aktive Regeln für denselben Wochentag
    // mit sich überschneidenden Zeitfenstern) können denselben Slot-Start
    // aus verschiedenen Fenstern erzeugen. Ein Slot-Start kann nur einmal
    // gebucht werden, also ist er auch nur einmal ein gültiges Ergebnis.
    const seenStarts = new Set<string>();

    for (const window of windows) {
      const windowStartMs = toUtc(`${cursorDay}T${window.startTime}`).getTime();
      const windowEndMs = toUtc(`${cursorDay}T${window.endTime}`).getTime();
      const slotMs = window.slotMinutes * 60_000;
      const bufferMs = window.bufferMinutes * 60_000;

      for (
        let slotStart = windowStartMs;
        slotStart + slotMs <= windowEndMs;
        slotStart += slotMs
      ) {
        const slotEnd = slotStart + slotMs;
        if (slotStart < earliestStartMs) continue;

        const conflicts = bookedRanges.some(
          (booked) =>
            slotStart < booked.end + bufferMs &&
            slotEnd > booked.start - bufferMs
        );
        if (conflicts) continue;

        const startIso = new Date(slotStart).toISOString();
        if (seenStarts.has(startIso)) continue;
        seenStarts.add(startIso);

        daySlots.push({ start: startIso, end: new Date(slotEnd).toISOString() });
      }
    }

    if (daySlots.length > 0) {
      daySlots.sort((a, b) => a.start.localeCompare(b.start));
      result.set(cursorDay, daySlots);
    }

    cursorDay = addDays(cursorDay, 1);
  }

  return result;
}
