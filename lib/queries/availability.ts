import { computeAvailability, type Slot } from "@/lib/availability";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_SLOT_MINUTES = 30;
const DEFAULT_LEAD_TIME_HOURS = 24;
const DEFAULT_HORIZON_DAYS = 30;

/**
 * Liest Wochenregeln, Ausnahmen, Einstellungen und bereits gebuchte Termine
 * und berechnet daraus die freien Slots. Nutzt den admin-Client, weil
 * `bookings` bewusst keine anon-Policy hat (siehe supabase_schema.sql).
 */
export async function getAvailability(
  now?: Date
): Promise<Map<string, Slot[]>> {
  const supabase = createAdminClient();
  const nowValue = now ?? new Date();

  const [rulesResult, exceptionsResult, settingsResult] = await Promise.all([
    supabase.from("availability_rules").select("*").eq("active", true),
    supabase.from("availability_exceptions").select("*"),
    supabase.from("settings").select("*"),
  ]);

  if (rulesResult.error) throw rulesResult.error;
  if (exceptionsResult.error) throw exceptionsResult.error;
  if (settingsResult.error) throw settingsResult.error;

  const settingsMap = new Map(
    (settingsResult.data ?? []).map((row) => [row.key, row.value])
  );
  const slotMinutes = Number(
    settingsMap.get("slot_minutes") ?? DEFAULT_SLOT_MINUTES
  );
  const leadTimeHours = Number(
    settingsMap.get("lead_time_hours") ?? DEFAULT_LEAD_TIME_HOURS
  );
  const horizonDays = Number(
    settingsMap.get("horizon_days") ?? DEFAULT_HORIZON_DAYS
  );

  const horizonEnd = new Date(
    nowValue.getTime() + horizonDays * 86_400_000
  ).toISOString();

  const bookingsResult = await supabase
    .from("bookings")
    .select("starts_at, ends_at")
    .eq("status", "gebucht")
    .gte("starts_at", nowValue.toISOString())
    .lte("starts_at", horizonEnd);

  if (bookingsResult.error) throw bookingsResult.error;

  return computeAvailability({
    rules: rulesResult.data ?? [],
    exceptions: exceptionsResult.data ?? [],
    bookedRanges: (bookingsResult.data ?? []).map((booking) => ({
      startsAt: booking.starts_at,
      endsAt: booking.ends_at,
    })),
    settings: { slotMinutes, leadTimeHours, horizonDays },
    now: nowValue,
  });
}

/**
 * Liest den Meeting-Link aus den Einstellungen (nicht aus einer Env-Variable —
 * das ist bewusst pflegbar über /admin/einstellungen in Phase 8).
 */
export async function getMeetingUrl(): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "meeting_url")
    .maybeSingle();

  if (error) throw error;
  return typeof data?.value === "string" ? data.value : null;
}
