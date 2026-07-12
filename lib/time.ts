/**
 * Die einzige Stelle im Projekt, an der zwischen UTC (Speicherung in der DB)
 * und Europe/Berlin (Anzeige) umgerechnet wird. Nirgendwo sonst Zeitzonen-Logik.
 */

const BERLIN_TIME_ZONE = "Europe/Berlin";

/**
 * Formatiert einen UTC-Zeitpunkt für die Anzeige in deutscher Zeit.
 */
export function formatBerlin(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("de-DE", {
    ...options,
    timeZone: BERLIN_TIME_ZONE,
  }).format(value);
}

function getBerlinOffsetMs(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BERLIN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(instant);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") === 24 ? 0 : get("hour"),
    get("minute"),
    get("second")
  );

  return asUtc - instant.getTime();
}

/**
 * Wandelt eine als Berlin-Ortszeit gemeinte Zeitangabe ("YYYY-MM-DDTHH:mm[:ss]",
 * ohne Zeitzonen-Suffix) in einen UTC-Zeitpunkt um. Berücksichtigt Sommer-/
 * Winterzeit für das jeweilige Datum.
 */
export function toUtc(localDateTime: string): Date {
  const naiveUtc = new Date(
    localDateTime.endsWith("Z") ? localDateTime : `${localDateTime}Z`
  );
  const offsetMs = getBerlinOffsetMs(naiveUtc);
  return new Date(naiveUtc.getTime() - offsetMs);
}

/**
 * Liefert den UTC-Zeitraum, der einem vollen Kalendertag in Berlin entspricht
 * (00:00 bis 24:00 Ortszeit). Nützlich, um Buchungen/Verfügbarkeiten eines
 * Tages abzufragen, unabhängig von der Zeitzone des Servers.
 */
export function berlinDayRange(day: string): { start: Date; end: Date } {
  const start = toUtc(`${day}T00:00:00`);

  const [year, month, date] = day.split("-").map(Number);
  const nextDay = new Date(Date.UTC(year, month - 1, date + 1));
  const nextDayString = nextDay.toISOString().slice(0, 10);
  const end = toUtc(`${nextDayString}T00:00:00`);

  return { start, end };
}
