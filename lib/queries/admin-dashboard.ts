import { createAdminClient } from "@/lib/supabase/admin";
import { getBerlinDateString } from "@/lib/time";
import type { LeadSegment, LeadStatus } from "@/types/database";

export interface DashboardMetrics {
  leadsLast7Days: number;
  upcomingBookingsCount: number;
  checkCompletionRate: number;
  publishedPostsCount: number;
}

export interface UpcomingBooking {
  id: string;
  startsAt: string;
  leadId: string;
  leadName: string;
  segment: LeadSegment;
}

export interface LatestLead {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  createdAt: string;
}

export interface LeadsPerDay {
  date: string;
  label: string;
  count: number;
}

/**
 * Alle Zugriffe hier laufen bewusst über den admin-Client (service_role),
 * nie über den anon-Client — auch nicht über die eingeloggte Admin-Session.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createAdminClient();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString();

  const [leadsResult, bookingsResult, responsesResult, postsResult] =
    await Promise.all([
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "gebucht")
        .gte("starts_at", now.toISOString()),
      supabase.from("quiz_responses").select("completed"),
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "veroeffentlicht"),
    ]);

  const responses = responsesResult.data ?? [];
  const completionRate =
    responses.length > 0
      ? Math.round(
          (responses.filter((response) => response.completed).length /
            responses.length) *
            100
        )
      : 0;

  return {
    leadsLast7Days: leadsResult.count ?? 0,
    upcomingBookingsCount: bookingsResult.count ?? 0,
    checkCompletionRate: completionRate,
    publishedPostsCount: postsResult.count ?? 0,
  };
}

export async function getUpcomingBookings(
  limit = 5
): Promise<UpcomingBooking[]> {
  const supabase = createAdminClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id, starts_at, lead_id")
    .eq("status", "gebucht")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  if (!bookings || bookings.length === 0) return [];

  const leadIds = Array.from(
    new Set(bookings.map((booking) => booking.lead_id))
  );
  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("id, name, segment")
    .in("id", leadIds);

  if (leadsError) throw leadsError;

  const leadById = new Map((leads ?? []).map((lead) => [lead.id, lead]));

  return bookings.map((booking) => {
    const lead = leadById.get(booking.lead_id);
    return {
      id: booking.id,
      startsAt: booking.starts_at,
      leadId: booking.lead_id,
      leadName: lead?.name ?? "Unbekannt",
      segment: lead?.segment ?? "privat",
    };
  });
}

export async function getLatestLeads(limit = 5): Promise<LatestLead[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("leads")
    .select("id, name, email, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    status: lead.status,
    createdAt: lead.created_at,
  }));
}

export async function getLeadsPerDay(days = 30): Promise<LeadsPerDay[]> {
  const supabase = createAdminClient();
  const now = new Date();
  const since = new Date(now.getTime() - (days - 1) * 86_400_000);

  const { data, error } = await supabase
    .from("leads")
    .select("created_at")
    .gte("created_at", since.toISOString());

  if (error) throw error;

  const countByDay = new Map<string, number>();
  for (const lead of data ?? []) {
    const day = getBerlinDateString(new Date(lead.created_at));
    countByDay.set(day, (countByDay.get(day) ?? 0) + 1);
  }

  const result: LeadsPerDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = getBerlinDateString(new Date(now.getTime() - i * 86_400_000));
    const [, month, day] = date.split("-");
    result.push({
      date,
      label: `${day}.${month}.`,
      count: countByDay.get(date) ?? 0,
    });
  }

  return result;
}
