import { createAdminClient } from "@/lib/supabase/admin";
import type { BookingStatus, LeadSegment, LeadStatus } from "@/types/database";

export interface LeadListRow {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  segment: LeadSegment;
  status: LeadStatus;
  source: string | null;
  createdAt: string;
  bookingStartsAt: string | null;
  bookingStatus: BookingStatus | null;
}

/** Wählt pro Lead den relevantesten Termin: der nächste kommende gebuchte, sonst der letzte. */
function pickBooking(
  bookings: { starts_at: string; status: BookingStatus }[]
): { starts_at: string; status: BookingStatus } | null {
  if (bookings.length === 0) return null;
  const now = Date.now();

  const upcoming = bookings
    .filter(
      (b) => b.status === "gebucht" && new Date(b.starts_at).getTime() >= now
    )
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  if (upcoming[0]) return upcoming[0];

  return [...bookings].sort((a, b) =>
    b.starts_at.localeCompare(a.starts_at)
  )[0];
}

/**
 * Lädt alle Leads für die CRM-Tabelle inkl. relevantestem Termin. Filterung,
 * Suche, Sortierung und Seitengröße laufen clientseitig in der Tabelle —
 * das Lead-Volumen einer kleinen Firma bleibt weit unter der Grenze, ab der
 * das ein Problem wäre.
 */
export async function getLeadsForTable(): Promise<LeadListRow[]> {
  const supabase = createAdminClient();

  const [leadsResult, bookingsResult] = await Promise.all([
    supabase
      .from("leads")
      .select(
        "id, name, email, company, phone, segment, status, source, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase.from("bookings").select("lead_id, starts_at, status"),
  ]);

  if (leadsResult.error) throw leadsResult.error;
  if (bookingsResult.error) throw bookingsResult.error;

  const bookingsByLead = new Map<
    string,
    { starts_at: string; status: BookingStatus }[]
  >();
  for (const booking of bookingsResult.data ?? []) {
    const list = bookingsByLead.get(booking.lead_id) ?? [];
    list.push({ starts_at: booking.starts_at, status: booking.status });
    bookingsByLead.set(booking.lead_id, list);
  }

  return (leadsResult.data ?? []).map((lead) => {
    const booking = pickBooking(bookingsByLead.get(lead.id) ?? []);
    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      phone: lead.phone,
      segment: lead.segment,
      status: lead.status,
      source: lead.source,
      createdAt: lead.created_at,
      bookingStartsAt: booking?.starts_at ?? null,
      bookingStatus: booking?.status ?? null,
    };
  });
}
