import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AvailabilityException,
  AvailabilityRule,
  BookingStatus,
} from "@/types/database";

export interface BookingWithLead {
  id: string;
  leadId: string;
  leadName: string;
  leadEmail: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  meetingUrl: string | null;
  message: string | null;
}

/** Alle Buchungen (kommend und vergangen) inkl. Lead-Name, neueste zuerst. */
export async function getBookingsList(): Promise<BookingWithLead[]> {
  const supabase = createAdminClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id, lead_id, starts_at, ends_at, status, meeting_url, message")
    .order("starts_at", { ascending: false })
    .limit(500);

  if (error) throw error;
  if (!bookings || bookings.length === 0) return [];

  const leadIds = Array.from(new Set(bookings.map((b) => b.lead_id)));
  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("id, name, email")
    .in("id", leadIds);

  if (leadsError) throw leadsError;

  const leadById = new Map((leads ?? []).map((lead) => [lead.id, lead]));

  return bookings.map((booking) => {
    const lead = leadById.get(booking.lead_id);
    return {
      id: booking.id,
      leadId: booking.lead_id,
      leadName: lead?.name ?? "Unbekannt",
      leadEmail: lead?.email ?? "",
      startsAt: booking.starts_at,
      endsAt: booking.ends_at,
      status: booking.status,
      meetingUrl: booking.meeting_url,
      message: booking.message,
    };
  });
}

export interface AvailabilityEditorData {
  rules: AvailabilityRule[];
  exceptions: AvailabilityException[];
  settings: {
    slotMinutes: number;
    leadTimeHours: number;
    horizonDays: number;
  };
  bookedRanges: { startsAt: string; endsAt: string }[];
}

const DEFAULT_SLOT_MINUTES = 30;
const DEFAULT_LEAD_TIME_HOURS = 24;
const DEFAULT_HORIZON_DAYS = 30;

/** Alles, was der Verfügbarkeits-Editor und seine Live-Vorschau brauchen. */
export async function getAvailabilityEditorData(): Promise<AvailabilityEditorData> {
  const supabase = createAdminClient();

  const [rulesResult, exceptionsResult, settingsResult, bookingsResult] =
    await Promise.all([
      supabase
        .from("availability_rules")
        .select("*")
        .order("weekday", { ascending: true }),
      supabase
        .from("availability_exceptions")
        .select("*")
        .order("day", { ascending: true }),
      supabase.from("settings").select("*"),
      supabase
        .from("bookings")
        .select("starts_at, ends_at")
        .eq("status", "gebucht")
        .gte("starts_at", new Date().toISOString()),
    ]);

  if (rulesResult.error) throw rulesResult.error;
  if (exceptionsResult.error) throw exceptionsResult.error;
  if (settingsResult.error) throw settingsResult.error;
  if (bookingsResult.error) throw bookingsResult.error;

  const settingsMap = new Map(
    (settingsResult.data ?? []).map((row) => [row.key, row.value])
  );

  return {
    rules: rulesResult.data ?? [],
    exceptions: exceptionsResult.data ?? [],
    settings: {
      slotMinutes: Number(
        settingsMap.get("slot_minutes") ?? DEFAULT_SLOT_MINUTES
      ),
      leadTimeHours: Number(
        settingsMap.get("lead_time_hours") ?? DEFAULT_LEAD_TIME_HOURS
      ),
      horizonDays: Number(
        settingsMap.get("horizon_days") ?? DEFAULT_HORIZON_DAYS
      ),
    },
    bookedRanges: (bookingsResult.data ?? []).map((booking) => ({
      startsAt: booking.starts_at,
      endsAt: booking.ends_at,
    })),
  };
}
