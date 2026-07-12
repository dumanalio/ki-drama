import { NextResponse } from "next/server";

import {
  sendBookingAdminNotification,
  sendBookingConfirmation,
} from "@/lib/email/booking-emails";
import { buildIcs } from "@/lib/ics";
import { getAvailability, getMeetingUrl } from "@/lib/queries/availability";
import { createAdminClient } from "@/lib/supabase/admin";
import { bookingRescheduleSchema } from "@/lib/validation/booking";

const UNIQUE_VIOLATION = "23505";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Die Anfrage konnte nicht gelesen werden." },
      { status: 400 }
    );
  }

  const parsed = bookingRescheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Die Angaben sind unvollständig oder ungültig." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: booking, error: findError } = await supabase
    .from("bookings")
    .select("id, lead_id, status")
    .eq("manage_token", token)
    .maybeSingle();

  if (findError) {
    console.error("[api/termin] Fehler beim Laden der Buchung:", findError);
    return NextResponse.json(
      {
        error:
          "Der Termin konnte nicht geändert werden. Bitte versuche es erneut.",
      },
      { status: 500 }
    );
  }

  if (!booking || booking.status !== "gebucht") {
    return NextResponse.json(
      { error: "Dieser Termin wurde nicht gefunden." },
      { status: 404 }
    );
  }

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("name, email")
    .eq("id", booking.lead_id)
    .maybeSingle();

  if (leadError || !lead) {
    console.error("[api/termin] Fehler beim Laden des Leads:", leadError);
    return NextResponse.json(
      {
        error:
          "Der Termin konnte nicht geändert werden. Bitte versuche es erneut.",
      },
      { status: 500 }
    );
  }

  let availability: Awaited<ReturnType<typeof getAvailability>>;
  try {
    availability = await getAvailability();
  } catch (error) {
    console.error("[api/termin] Fehler beim Prüfen der Verfügbarkeit:", error);
    return NextResponse.json(
      {
        error:
          "Der Termin konnte nicht geändert werden. Bitte versuche es erneut.",
      },
      { status: 500 }
    );
  }

  const slot = Array.from(availability.values())
    .flat()
    .find((candidate) => candidate.start === parsed.data.startsAt);

  if (!slot) {
    return NextResponse.json(
      {
        error:
          "Dieser Termin wurde gerade vergeben. Bitte wähle einen anderen.",
      },
      { status: 409 }
    );
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ starts_at: slot.start, ends_at: slot.end })
    .eq("id", booking.id);

  if (updateError) {
    if (updateError.code === UNIQUE_VIOLATION) {
      return NextResponse.json(
        {
          error:
            "Dieser Termin wurde gerade vergeben. Bitte wähle einen anderen.",
        },
        { status: 409 }
      );
    }
    console.error("[api/termin] Fehler beim Verschieben:", updateError);
    return NextResponse.json(
      {
        error:
          "Der Termin konnte nicht geändert werden. Bitte versuche es erneut.",
      },
      { status: 500 }
    );
  }

  await supabase.from("lead_activities").insert({
    lead_id: booking.lead_id,
    kind: "termin",
    body: "Termin verschoben",
  });

  const meetingUrl = await getMeetingUrl().catch(() => null);
  const icsContent = buildIcs({
    uid: `${booking.id}@ki-drama`,
    startsAt: slot.start,
    endsAt: slot.end,
    summary: "KI-Drama Gespräch",
    description: meetingUrl ? `Meeting-Link: ${meetingUrl}` : undefined,
    location: meetingUrl ?? undefined,
  });

  await sendBookingConfirmation({
    supabase,
    leadName: lead.name,
    leadEmail: lead.email,
    startsAt: slot.start,
    meetingUrl,
    manageToken: token,
    icsContent,
    kind: "rescheduled",
  });
  await sendBookingAdminNotification({
    supabase,
    leadName: lead.name,
    startsAt: slot.start,
    kind: "created",
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: booking, error: findError } = await supabase
    .from("bookings")
    .select("id, lead_id, starts_at, status")
    .eq("manage_token", token)
    .maybeSingle();

  if (findError) {
    console.error("[api/termin] Fehler beim Laden der Buchung:", findError);
    return NextResponse.json(
      {
        error:
          "Der Termin konnte nicht abgesagt werden. Bitte versuche es erneut.",
      },
      { status: 500 }
    );
  }

  if (!booking || booking.status !== "gebucht") {
    return NextResponse.json(
      { error: "Dieser Termin wurde nicht gefunden." },
      { status: 404 }
    );
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "abgesagt" })
    .eq("id", booking.id);

  if (updateError) {
    console.error("[api/termin] Fehler beim Absagen:", updateError);
    return NextResponse.json(
      {
        error:
          "Der Termin konnte nicht abgesagt werden. Bitte versuche es erneut.",
      },
      { status: 500 }
    );
  }

  await supabase.from("lead_activities").insert({
    lead_id: booking.lead_id,
    kind: "termin",
    body: "Termin abgesagt",
  });

  const { data: lead } = await supabase
    .from("leads")
    .select("name")
    .eq("id", booking.lead_id)
    .maybeSingle();

  await sendBookingAdminNotification({
    supabase,
    leadName: lead?.name ?? "Unbekannt",
    startsAt: booking.starts_at,
    kind: "cancelled",
  });

  return NextResponse.json({ ok: true });
}
