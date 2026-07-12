import { NextResponse } from "next/server";

import { buildIcs } from "@/lib/ics";
import { getMeetingUrl } from "@/lib/queries/availability";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id, starts_at, ends_at, status")
    .eq("manage_token", token)
    .maybeSingle();

  if (error) {
    console.error("[api/ics] Fehler beim Laden der Buchung:", error);
    return NextResponse.json(
      { error: "Die Kalenderdatei konnte nicht erstellt werden." },
      { status: 500 }
    );
  }

  if (!booking || booking.status !== "gebucht") {
    return NextResponse.json(
      { error: "Dieser Termin wurde nicht gefunden." },
      { status: 404 }
    );
  }

  const meetingUrl = await getMeetingUrl().catch(() => null);
  const icsContent = buildIcs({
    uid: `${booking.id}@ki-drama`,
    startsAt: booking.starts_at,
    endsAt: booking.ends_at,
    summary: "KI-Drama Gespräch",
    description: meetingUrl ? `Meeting-Link: ${meetingUrl}` : undefined,
    location: meetingUrl ?? undefined,
  });

  return new NextResponse(icsContent, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="termin.ics"',
    },
  });
}
