import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkSubmitSchema } from "@/lib/validation/check";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendCheckEmails } from "@/lib/email/check-emails";

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        error:
          "Zu viele Anfragen von deiner Verbindung. Bitte versuche es in einer Stunde erneut.",
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Die Anfrage konnte nicht gelesen werden." },
      { status: 400 }
    );
  }

  const parsed = checkSubmitSchema.safeParse(body);
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

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (!turnstileSecret) {
    return NextResponse.json(
      { error: "Sicherheitsprüfung ist nicht konfiguriert." },
      { status: 500 }
    );
  }

  const verifyResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: turnstileSecret,
        response: data.turnstileToken,
        remoteip: ip,
      }),
    }
  );
  const verifyResult = (await verifyResponse.json()) as { success: boolean };

  if (!verifyResult.success) {
    return NextResponse.json(
      {
        error:
          "Sicherheitsprüfung fehlgeschlagen. Bitte lade die Seite neu und versuche es erneut.",
      },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  const { data: existingLead, error: findLeadError } = await supabase
    .from("leads")
    .select("id")
    .eq("email", data.email)
    .maybeSingle();

  if (findLeadError) {
    return NextResponse.json(
      { error: "Der Check konnte nicht gespeichert werden. Bitte versuche es erneut." },
      { status: 500 }
    );
  }

  let leadId: string;

  if (existingLead) {
    const { data: updatedLead, error: updateError } = await supabase
      .from("leads")
      .update({
        name: data.name,
        company: data.company ?? null,
        segment: data.segment,
        source: "check",
        consent_at: nowIso,
      })
      .eq("id", existingLead.id)
      .select("id")
      .single();

    if (updateError || !updatedLead) {
      return NextResponse.json(
        { error: "Der Check konnte nicht gespeichert werden. Bitte versuche es erneut." },
        { status: 500 }
      );
    }
    leadId = updatedLead.id;
  } else {
    const { data: createdLead, error: insertError } = await supabase
      .from("leads")
      .insert({
        name: data.name,
        email: data.email,
        company: data.company ?? null,
        segment: data.segment,
        source: "check",
        consent_at: nowIso,
      })
      .select("id")
      .single();

    if (insertError || !createdLead) {
      return NextResponse.json(
        { error: "Der Check konnte nicht gespeichert werden. Bitte versuche es erneut." },
        { status: 500 }
      );
    }
    leadId = createdLead.id;
  }

  const { error: responseError } = await supabase.from("quiz_responses").upsert(
    {
      lead_id: leadId,
      session_id: data.sessionId,
      segment: data.segment,
      answers: data.answers,
      completed: true,
    },
    { onConflict: "session_id" }
  );

  if (responseError) {
    return NextResponse.json(
      { error: "Der Check konnte nicht gespeichert werden. Bitte versuche es erneut." },
      { status: 500 }
    );
  }

  await supabase.from("lead_activities").insert({
    lead_id: leadId,
    kind: "status",
    body: "Check abgeschlossen",
  });

  const { data: questions } = await supabase.from("quiz_questions").select("*");

  await sendCheckEmails({
    supabase,
    leadName: data.name,
    leadEmail: data.email,
    company: data.company,
    segment: data.segment,
    answers: data.answers,
    questions: questions ?? [],
    sessionId: data.sessionId,
  });

  return NextResponse.json({ leadId, sessionId: data.sessionId });
}
