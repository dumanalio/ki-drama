"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/actions/types";
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin";
import {
  generalSettingsSchema,
  landingPageContentSchema,
} from "@/lib/validation/settings";
import type { Json } from "@/types/database";

function fail(error: unknown, fallback: string): { ok: false; error: string } {
  if (error instanceof AdminAuthError) {
    return { ok: false, error: "Kein Zugriff. Bitte melde dich erneut an." };
  }
  console.error("[actions/settings]", error);
  return { ok: false, error: fallback };
}

export async function saveGeneralSettings(
  input: unknown
): Promise<ActionResult> {
  const parsed = generalSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Die Angaben sind ungültig.",
    };
  }

  try {
    const { adminClient } = await requireAdmin();
    const data = parsed.data;
    const rows: { key: string; value: Json }[] = [
      { key: "meeting_url", value: data.meetingUrl },
      { key: "slot_minutes", value: data.slotMinutes },
      { key: "lead_time_hours", value: data.leadTimeHours },
      { key: "horizon_days", value: data.horizonDays },
      { key: "notify_email", value: data.notifyEmail },
      { key: "email_confirmation_note", value: data.emailConfirmationNote },
      { key: "email_signoff", value: data.emailSignoff },
      { key: "header_button_color", value: data.headerButtonColor },
      {
        key: "header_button_custom_color",
        value: data.headerButtonCustomColor,
      },
    ];

    for (const row of rows) {
      const { error } = await adminClient
        .from("settings")
        .upsert({ key: row.key, value: row.value }, { onConflict: "key" });
      if (error) throw error;
    }

    revalidatePath("/admin/einstellungen");
    // Header/Footer stecken im geteilten Layout -- "layout" revalidiert sie
    // für alle Seiten, nicht nur für "/".
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Die Einstellungen konnten nicht gespeichert werden. Bitte versuche es erneut."
    );
  }
}

export async function saveLandingPageContent(
  input: unknown
): Promise<ActionResult> {
  const parsed = landingPageContentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Die Angaben sind ungültig.",
    };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { error } = await adminClient
      .from("settings")
      .upsert(
        { key: "landing_page", value: parsed.data as unknown as Json },
        { onConflict: "key" }
      );
    if (error) throw error;

    revalidatePath("/admin/einstellungen");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Die Startseite konnte nicht gespeichert werden. Bitte versuche es erneut."
    );
  }
}
