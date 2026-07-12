import { NextResponse } from "next/server";

import {
  sendBookingAdminNotification,
  sendBookingConfirmation,
} from "@/lib/email/booking-emails";
import { buildIcs } from "@/lib/ics";
import { getAvailability, getMeetingUrl } from "@/lib/queries/availability";
import { createAdminClient } from "@/lib/supabase/admin";
import { bookingCreateSchema } from "@/lib/validation/booking";

const UNIQUE_VIOLATION = "23505";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Die Anfrage konnte nicht gelesen werden." },
      { status: 400 }
    );
  }

  const parsed = bookingCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Die Angaben sind unvollständig oder ungültig.",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const supabase = createAdminClient();

  const { data: response, error: responseError } = await supabase
    .from("quiz_responses")
    .select("lead_id")
    .eq("session_id", data.sessionId)
    .maybeSingle();

  if (responseError) {
    console.error(
      "[api/booking] Fehler beim Auflösen der Sitzung:",
      responseError
    );
    return NextResponse.json(
      {
        error:
          "Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.",
      },
      { status: 500 }
    );
  }

  if (!response?.lead_id) {
    return NextResponse.json(
      {
        error: "Deine Sitzung ist abgelaufen. Bitte starte den Check erneut.",
      },
      { status: 400 }
    );
  }

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, name, email")
    .eq("id", response.lead_id)
    .maybeSingle();

  if (leadError || !lead) {
    console.error("[api/booking] Fehler beim Laden des Leads:", leadError);
    return NextResponse.json(
      {
        error:
          "Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.",
      },
      { status: 500 }
    );
  }

  // Erneute serverseitige Prüfung: ist der Slot WIRKLICH noch frei?
  // Der UNIQUE-Index unten ist die letzte Verteidigungslinie gegen echte
  // Race Conditions — diese Prüfung fängt den häufigen Fall ab (Slot wurde
  // zwischen Laden und Absenden vergeben) mit einer sauberen Fehlermeldung.
  let availability: Awaited<ReturnType<typeof getAvailability>>;
  try {
    availability = await getAvailability();
  } catch (error) {
    console.error("[api/booking] Fehler beim Prüfen der Verfügbarkeit:", error);
    return NextResponse.json(
      {
        error:
          "Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.",
      },
      { status: 500 }
    );
  }

  const slot = Array.from(availability.values())
    .flat()
    .find((candidate) => candidate.start === data.startsAt);

  if (!slot) {
    return NextResponse.json(
      {
        error:
          "Dieser Termin wurde gerade vergeben. Bitte wähle einen anderen.",
      },
      { status: 409 }
    );
  }

  const { data: booking, error: insertError } = await supabase
    .from("bookings")
    .insert({
      lead_id: lead.id,
      starts_at: slot.start,
      ends_at: slot.end,
      message: data.message ?? null,
    })
    .select("id, starts_at, ends_at, manage_token")
    .single();

  if (insertError || !booking) {
    if (insertError?.code === UNIQUE_VIOLATION) {
      return NextResponse.json(
        {
          error:
            "Dieser Termin wurde gerade vergeben. Bitte wähle einen anderen.",
        },
        { status: 409 }
      );
    }

    console.error(
      "[api/booking] Fehler beim Anlegen der Buchung:",
      insertError
    );
    return NextResponse.json(
      {
        error:
          "Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.",
      },
      { status: 500 }
    );
  }

  await supabase
    .from("leads")
    .update({ status: "termin_gebucht" })
    .eq("id", lead.id);

  await supabase.from("lead_activities").insert({
    lead_id: lead.id,
    kind: "termin",
    body: "Termin gebucht",
  });

  const meetingUrl = await getMeetingUrl().catch(() => null);
  const icsContent = buildIcs({
    uid: `${booking.id}@ki-drama`,
    startsAt: booking.starts_at,
    endsAt: booking.ends_at,
    summary: "KI-Drama Gespräch",
    description: meetingUrl ? `Meeting-Link: ${meetingUrl}` : undefined,
    location: meetingUrl ?? undefined,
  });

  await sendBookingConfirmation({
    supabase,
    leadName: lead.name,
    leadEmail: lead.email,
    startsAt: booking.starts_at,
    meetingUrl,
    manageToken: booking.manage_token,
    icsContent,
  });
  await sendBookingAdminNotification({
    supabase,
    leadName: lead.name,
    startsAt: booking.starts_at,
    kind: "created",
  });

  return NextResponse.json({ manageToken: booking.manage_token });
}
