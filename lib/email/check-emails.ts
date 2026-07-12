import type { SupabaseClient } from "@supabase/supabase-js";

import { EMAIL_FROM, getResendClient } from "@/lib/email/resend";
import type { Database, QuizQuestion } from "@/types/database";

interface AnswerSummaryLine {
  question: string;
  answer: string;
}

function buildAnswerSummary(
  answers: Record<string, string | string[]>,
  questions: QuizQuestion[]
): AnswerSummaryLine[] {
  const byId = new Map(questions.map((question) => [question.id, question]));

  return Object.entries(answers).map(([questionId, value]) => {
    const question = byId.get(questionId);
    if (!question) {
      return {
        question: questionId,
        answer: Array.isArray(value) ? value.join(", ") : value,
      };
    }

    const labelFor = (raw: string) =>
      question.options.find((option) => option.value === raw)?.label ?? raw;

    return {
      question: question.title,
      answer: Array.isArray(value)
        ? value.map(labelFor).join(", ")
        : labelFor(value),
    };
  });
}

interface SendCheckEmailsInput {
  supabase: SupabaseClient<Database>;
  leadName: string;
  leadEmail: string;
  company?: string;
  segment: "privat" | "business";
  answers: Record<string, string | string[]>;
  questions: QuizQuestion[];
  sessionId: string;
}

async function sendAndLog(
  supabase: SupabaseClient<Database>,
  input: { to: string; subject: string; text: string; template: string }
): Promise<void> {
  const resend = getResendClient();

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      text: input.text,
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

/**
 * Verschickt beide Check-Mails und protokolliert sie in email_log.
 * Fehlschläge brechen den Aufruf nicht ab — der Lead ist bereits gespeichert,
 * bevor diese Funktion überhaupt aufgerufen wird.
 */
export async function sendCheckEmails(input: SendCheckEmailsInput): Promise<void> {
  const summary = buildAnswerSummary(input.answers, input.questions);
  const segmentLabel = input.segment === "privat" ? "Privat" : "Unternehmen";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (adminEmail) {
    const adminSubject = `Neuer Check: ${input.leadName} (${segmentLabel})`;
    const adminText = [
      `Neuer Check von ${input.leadName} (${segmentLabel})`,
      "",
      `E-Mail: ${input.leadEmail}`,
      input.company ? `Firma: ${input.company}` : null,
      "",
      "Antworten:",
      ...summary.map((line) => `- ${line.question}: ${line.answer}`),
    ]
      .filter((line): line is string => line !== null)
      .join("\n");

    await sendAndLog(input.supabase, {
      to: adminEmail,
      subject: adminSubject,
      text: adminText,
      template: "check_admin_notification",
    });
  }

  const terminUrl = `${siteUrl}/check/termin?session=${input.sessionId}`;
  const leadText = [
    `Hallo ${input.leadName},`,
    "",
    "danke für deinen Check. Im nächsten Schritt kannst du direkt einen Termin für ein kurzes Gespräch buchen:",
    "",
    terminUrl,
    "",
    "Bis gleich,",
    "KI-Drama",
  ].join("\n");

  await sendAndLog(input.supabase, {
    to: input.leadEmail,
    subject: "Danke für deinen Check",
    text: leadText,
    template: "check_lead_confirmation",
  });
}
