import Link from "next/link";
import { CalendarX, Users as UsersIcon } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { KpiCard } from "@/components/admin/kpi-card";
import { LeadsChart } from "@/components/admin/leads-chart";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  getDashboardMetrics,
  getLatestLeads,
  getLeadsPerDay,
  getUpcomingBookings,
} from "@/lib/queries/admin-dashboard";
import { formatBerlin } from "@/lib/time";
import type { LeadSegment, LeadStatus } from "@/types/database";

const STATUS_LABELS: Record<LeadStatus, string> = {
  neu: "Neu",
  kontaktiert: "Kontaktiert",
  termin_gebucht: "Termin gebucht",
  gespraech_gefuehrt: "Gespräch geführt",
  kunde: "Kunde",
  kein_interesse: "Kein Interesse",
};

const STATUS_VARIANTS: Record<LeadStatus, BadgeProps["variant"]> = {
  neu: "soft",
  kontaktiert: "soft",
  termin_gebucht: "warning",
  gespraech_gefuehrt: "soft",
  kunde: "success",
  kein_interesse: "danger",
};

const SEGMENT_LABELS: Record<LeadSegment, string> = {
  privat: "Privat",
  business: "Unternehmen",
};

export default async function AdminDashboardPage() {
  let metrics: Awaited<ReturnType<typeof getDashboardMetrics>> | null = null;
  let upcomingBookings: Awaited<ReturnType<typeof getUpcomingBookings>> = [];
  let latestLeads: Awaited<ReturnType<typeof getLatestLeads>> = [];
  let leadsPerDay: Awaited<ReturnType<typeof getLeadsPerDay>> = [];
  let loadError = false;

  try {
    [metrics, upcomingBookings, latestLeads, leadsPerDay] = await Promise.all([
      getDashboardMetrics(),
      getUpcomingBookings(5),
      getLatestLeads(5),
      getLeadsPerDay(30),
    ]);
  } catch {
    loadError = true;
  }

  if (loadError || !metrics) {
    return (
      <>
        <AdminPageHeader title="Dashboard" />
        <ErrorState
          title="Dashboard konnte nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title="Dashboard" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Leads (7 Tage)" value={metrics.leadsLast7Days} />
        <KpiCard
          label="Termine (kommend)"
          value={metrics.upcomingBookingsCount}
        />
        <KpiCard
          label="Abschlussrate Check"
          value={`${metrics.checkCompletionRate}%`}
        />
        <KpiCard
          label="Veröffentlichte Beiträge"
          value={metrics.publishedPostsCount}
        />
      </div>

      <div className="border-line bg-surface shadow-card mb-8 rounded-xl border p-6">
        <h2 className="text-ink mb-4 text-[16px] font-semibold">
          Leads pro Tag (30 Tage)
        </h2>
        <LeadsChart data={leadsPerDay} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border-line bg-surface shadow-card rounded-xl border p-6">
          <h2 className="text-ink mb-4 text-[16px] font-semibold">
            Nächste Termine
          </h2>
          {upcomingBookings.length === 0 ? (
            <EmptyState
              icon={CalendarX}
              title="Keine anstehenden Termine"
              description="Sobald ein Termin gebucht wird, erscheint er hier."
            />
          ) : (
            <ul className="divide-line flex flex-col divide-y">
              {upcomingBookings.map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col">
                    <Link
                      href={`/admin/leads/${booking.leadId}`}
                      className="text-ink hover:text-accent text-[15px] font-medium"
                    >
                      {booking.leadName}
                    </Link>
                    <span className="text-ink-muted text-[13px]">
                      {formatBerlin(booking.startsAt, {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      Uhr
                    </span>
                  </div>
                  <Badge variant="soft">
                    {SEGMENT_LABELS[booking.segment]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-line bg-surface shadow-card rounded-xl border p-6">
          <h2 className="text-ink mb-4 text-[16px] font-semibold">
            Neueste Leads
          </h2>
          {latestLeads.length === 0 ? (
            <EmptyState
              icon={UsersIcon}
              title="Noch keine Leads"
              description="Sobald jemand den Check abschließt, erscheint er hier."
            />
          ) : (
            <ul className="divide-line flex flex-col divide-y">
              {latestLeads.map((lead) => (
                <li
                  key={lead.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="text-ink hover:text-accent text-[15px] font-medium"
                    >
                      {lead.name}
                    </Link>
                    <span className="text-ink-muted text-[13px]">
                      {lead.email}
                    </span>
                  </div>
                  <Badge variant={STATUS_VARIANTS[lead.status]}>
                    {STATUS_LABELS[lead.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
