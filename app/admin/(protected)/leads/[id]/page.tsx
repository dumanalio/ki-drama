import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";

import { LeadAddNoteForm } from "@/components/admin/lead-add-note-form";
import { LeadAnswers } from "@/components/admin/lead-answers";
import { LeadBookingPanel } from "@/components/admin/lead-booking-panel";
import { LeadNotes } from "@/components/admin/lead-notes";
import { LeadStatusSelect } from "@/components/admin/lead-status-select";
import { LeadTimeline } from "@/components/admin/lead-timeline";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { LEAD_SEGMENT_LABELS } from "@/lib/labels";
import { getLeadDetail } from "@/lib/queries/admin-lead-detail";

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let detail: Awaited<ReturnType<typeof getLeadDetail>> = null;
  let loadError = false;

  try {
    detail = await getLeadDetail(id);
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <>
        <AdminPageHeader title="Lead" />
        <ErrorState
          title="Lead konnte nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      </>
    );
  }

  if (!detail) notFound();

  const { lead, answeredQuestions, bookings, activities } = detail;
  const currentBooking = bookings[0] ?? null;

  return (
    <>
      <AdminPageHeader
        title={lead.name}
        action={
          <Link
            href="/admin/leads"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Zurück zur Liste
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-ink text-[20px] font-semibold">
                  {lead.name}
                </h2>
                {lead.company ? (
                  <p className="text-ink-soft text-[15px]">{lead.company}</p>
                ) : null}
              </div>
              <Badge variant="soft">{LEAD_SEGMENT_LABELS[lead.segment]}</Badge>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <a
                href={`mailto:${lead.email}`}
                className="text-ink-soft hover:text-accent focus-visible:ring-accent flex w-fit items-center gap-2 rounded text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                {lead.email}
              </a>
              {lead.phone ? (
                <a
                  href={`tel:${lead.phone}`}
                  className="text-ink-soft hover:text-accent focus-visible:ring-accent flex w-fit items-center gap-2 rounded text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  <Phone className="size-4 shrink-0" aria-hidden="true" />
                  {lead.phone}
                </a>
              ) : null}
            </div>

            <div className="border-line mt-5 border-t pt-5">
              <span className="text-ink-muted mb-1.5 block text-[13px] font-medium">
                Status
              </span>
              <LeadStatusSelect leadId={lead.id} status={lead.status} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Alle Antworten" />
            <LeadAnswers answeredQuestions={answeredQuestions} />
          </Card>

          {currentBooking ? (
            <Card>
              <CardHeader title="Termin" />
              <LeadBookingPanel booking={currentBooking} />
            </Card>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <LeadNotes leadId={lead.id} initialNotes={lead.notes} />
          </Card>

          <Card>
            <CardHeader title="Timeline" />
            <LeadTimeline activities={activities} />
            <LeadAddNoteForm leadId={lead.id} />
          </Card>
        </div>
      </div>
    </>
  );
}
