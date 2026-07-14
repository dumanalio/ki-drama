"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/actions/types";
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin";
import { formatZodError } from "@/lib/validation/format-zod-error";
import {
  generalSettingsSchema,
  landingPageContentSchema,
  navigationContentSchema,
} from "@/lib/validation/settings";
import type { Json } from "@/types/database";

const GENERAL_SETTINGS_LABELS: Record<string, string> = {
  meetingUrl: "Meeting-Link",
  slotMinutes: "Slotlänge",
  leadTimeHours: "Vorlaufzeit",
  horizonDays: "Buchungshorizont",
  notifyEmail: "Benachrichtigungs-E-Mail",
  emailConfirmationNote: "Zusätzlicher Hinweis (Bestätigungsmail)",
  emailSignoff: "Grußformel",
  headerButtonColor: "Header: Button-Farbe",
  headerButtonCustomColor: "Header: eigene Button-Farbe",
  headerLogoUrl: "Header-Logo",
  headerLogoAlt: "Header-Logo: Alt-Text",
  headerLogoHeight: "Header-Logo: Höhe",
  footerLogoUrl: "Footer-Logo",
  footerLogoAlt: "Footer-Logo: Alt-Text",
  footerLogoHeight: "Footer-Logo: Höhe",
};

const LANDING_CONTENT_LABELS: Record<string, string> = {
  hero: "Hero",
  eyebrow: "Eyebrow",
  title: "Überschrift",
  subtitle: "Unterzeile",
  text: "Text",
  primaryButtonLabel: "Primärer Button: Beschriftung",
  primaryButtonColor: "Primärer Button: Farbe",
  primaryButtonCustomColor: "Primärer Button: eigene Farbe",
  secondaryButtonLabel: "Sekundärer Button: Beschriftung",
  secondaryButtonColor: "Sekundärer Button: Farbe",
  secondaryButtonCustomColor: "Sekundärer Button: eigene Farbe",
  imageUrl: "Bild",
  imageAlt: "Bild: Alt-Text",
  closingCta: "Abschluss-CTA",
  buttonLabel: "Button: Beschriftung",
  buttonColor: "Button: Farbe",
  buttonCustomColor: "Button: eigene Farbe",
  sections: "Abschnitt",
  columns: "Spalte",
  checklistItems: "Häkchenliste",
  button: "Button",
  label: "Beschriftung",
  href: "Ziel-Link",
  color: "Farbe",
  customColor: "eigene Farbe",
  layout: "Layout",
  columnCount: "Spaltenzahl",
};

const NAVIGATION_LABELS: Record<string, string> = {
  header: "Header-Navigation",
  footerText: "Footer: Text unter dem Logo",
  footerColumns: "Footer-Spalte",
  heading: "Spaltenüberschrift",
  links: "Link",
  label: "Beschriftung",
  href: "Ziel-Link",
  visible: "Sichtbarkeit",
};

function fail(
  error: unknown,
  fallback: string,
  context: string
): { ok: false; error: string } {
  if (error instanceof AdminAuthError) {
    return { ok: false, error: "Kein Zugriff. Bitte melde dich erneut an." };
  }
  const supabaseError = error as {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  } | null;
  console.error(`[actions/settings] ${context}`, {
    message: supabaseError?.message,
    code: supabaseError?.code,
    details: supabaseError?.details,
    hint: supabaseError?.hint,
    raw: error,
  });
  return { ok: false, error: fallback };
}

export async function saveGeneralSettings(
  input: unknown
): Promise<ActionResult> {
  const parsed = generalSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: formatZodError(parsed.error, GENERAL_SETTINGS_LABELS),
    };
  }

  try {
    const { adminClient } = await requireAdmin();
    const data = parsed.data;
    const rows: { key: string; value: Json | null }[] = [
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
      { key: "header_logo_url", value: data.headerLogoUrl },
      { key: "header_logo_alt", value: data.headerLogoAlt },
      { key: "header_logo_height", value: data.headerLogoHeight },
      { key: "footer_logo_url", value: data.footerLogoUrl },
      { key: "footer_logo_alt", value: data.footerLogoAlt },
      { key: "footer_logo_height", value: data.footerLogoHeight },
    ];

    for (const row of rows) {
      // settings.value ist jsonb NOT NULL. PostgREST kann in einem Upsert
      // nicht zwischen "SQL NULL" und "JSON null" unterscheiden und würde
      // bei value: null immer SQL NULL schicken -- das verletzt die
      // Constraint. Ein logisch "leeres" Feld wird deshalb durch Entfernen
      // der Zeile dargestellt statt durch einen Null-Wert; die Lesefunktion
      // fällt bei fehlender Zeile ohnehin auf ihren Default zurück.
      if (row.value === null) {
        const { error } = await adminClient
          .from("settings")
          .delete()
          .eq("key", row.key);
        if (error) throw error;
        continue;
      }
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
      "Die Einstellungen konnten nicht gespeichert werden. Bitte versuche es erneut.",
      "saveGeneralSettings"
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
      error: formatZodError(parsed.error, LANDING_CONTENT_LABELS),
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
      "Die Startseite konnte nicht gespeichert werden. Bitte versuche es erneut.",
      "saveLandingPageContent"
    );
  }
}

export async function saveNavigationContent(
  input: unknown
): Promise<ActionResult> {
  const parsed = navigationContentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: formatZodError(parsed.error, NAVIGATION_LABELS),
    };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { error } = await adminClient
      .from("settings")
      .upsert(
        { key: "navigation", value: parsed.data as unknown as Json },
        { onConflict: "key" }
      );
    if (error) throw error;

    revalidatePath("/admin/einstellungen");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Die Navigation konnte nicht gespeichert werden. Bitte versuche es erneut.",
      "saveNavigationContent"
    );
  }
}
