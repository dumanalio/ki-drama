import type { SupabaseClient } from "@supabase/supabase-js";

import { EMAIL_FROM, getResendClient } from "@/lib/email/resend";
import type { Database } from "@/types/database";

export interface SendAndLogInput {
  to: string;
  subject: string;
  text: string;
  template: string;
  attachments?: { filename: string; content: string }[];
}

/**
 * Verschickt eine E-Mail über Resend und protokolliert das Ergebnis
 * (Erfolg oder Fehlschlag) immer in email_log. Wirft nie — ein
 * E-Mail-Fehlschlag darf einen bereits gespeicherten Vorgang (Lead,
 * Buchung) nicht rückgängig machen.
 */
export async function sendAndLog(
  supabase: SupabaseClient<Database>,
  input: SendAndLogInput
): Promise<void> {
  const resend = getResendClient();

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      text: input.text,
      attachments: input.attachments,
    });

    await supabase.from("email_log").insert({
      to_email: input.to,
      template: input.template,
      subject: input.subject,
      status: error ? "fehlgeschlagen" : "gesendet",
      error: error?.message ?? null,
    });
  } catch (err) {
    await supabase.from("email_log").insert({
      to_email: input.to,
      template: input.template,
      subject: input.subject,
      status: "fehlgeschlagen",
      error: err instanceof Error ? err.message : "Unbekannter Fehler",
    });
  }
}
