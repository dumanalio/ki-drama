import type { SupabaseClient } from "@supabase/supabase-js";

import { sendAndLog } from "@/lib/email/send-and-log";
import { formatBerlin } from "@/lib/time";
import type { Database } from "@/types/database";

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

interface SendBookingConfirmationInput {
  supabase: SupabaseClient<Database>;
  leadName: string;
  leadEmail: string;
  startsAt: string;
  meetingUrl: string | null;
  manageToken: string;
  icsContent: string;
  kind?: "created" | "rescheduled";
}

/** Bestätigungsmail an den Lead, inkl. .ics-Anhang und Absage-/Verschiebe-Link. */
export async function sendBookingConfirmation(
  input: SendBookingConfirmationInput
): Promise<void> {
  const manageUrl = `${siteUrl()}/termin/${input.manageToken}`;
  const formatted = formatBerlin(input.startsAt, DATE_FORMAT);
  const isReschedule = input.kind === "rescheduled";

  const text = [
    `Hallo ${input.leadName},`,
    "",
    isReschedule
      ? `dein Termin wurde verschoben auf: ${formatted} Uhr.`
      : `dein Termin ist bestätigt: ${formatted} Uhr.`,
    input.meetingUrl ? `Meeting-Link: ${input.meetingUrl}` : null,
    "",
    `Termin verschieben oder absagen: ${manageUrl}`,
    "",
    "Die Kalenderdatei ist angehängt.",
    "",
    "Bis dahin,",
    "KI-Drama",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  await sendAndLog(input.supabase, {
    to: input.leadEmail,
    subject: isReschedule
      ? "Dein Termin wurde verschoben"
      : "Dein Termin ist bestätigt",
    text,
    template: isReschedule ? "booking_rescheduled" : "booking_confirmation",
    attachments: [{ filename: "termin.ics", content: input.icsContent }],
  });
}

interface SendAdminNotificationInput {
  supabase: SupabaseClient<Database>;
  leadName: string;
  startsAt: string;
  kind: "created" | "cancelled";
}

/** Benachrichtigung an den Betreiber — neuer oder abgesagter Termin. */
export async function sendBookingAdminNotification(
  input: SendAdminNotificationInput
): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!adminEmail) return;

  const formatted = formatBerlin(input.startsAt, DATE_FORMAT);
  const isCancellation = input.kind === "cancelled";

  await sendAndLog(input.supabase, {
    to: adminEmail,
    subject: isCancellation
      ? `Termin abgesagt: ${input.leadName}`
      : `Neuer Termin: ${input.leadName}`,
    text: isCancellation
      ? `${input.leadName} hat den Termin am ${formatted} Uhr abgesagt.`
      : `${input.leadName} hat einen Termin gebucht: ${formatted} Uhr.`,
    template: isCancellation
      ? "booking_cancelled_notification"
      : "booking_admin_notification",
  });
}
