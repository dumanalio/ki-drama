import { createAdminClient } from "@/lib/supabase/admin";
import {
  EMPTY_LANDING_CONTENT,
  normalizeFaq,
  normalizeSection,
  type LandingButtonColor,
  type LandingPageContent,
  type LandingTextColor,
} from "@/lib/landing-content";
import {
  DEFAULT_NAVIGATION,
  normalizeNavigation,
  type NavigationContent,
} from "@/lib/navigation";

export interface GeneralSettings {
  meetingUrl: string;
  slotMinutes: number;
  leadTimeHours: number;
  horizonDays: number;
  notifyEmail: string;
  emailConfirmationNote: string;
  emailSignoff: string;
  headerButtonColor: LandingButtonColor;
  headerButtonCustomColor: string | null;
  headerButtonTextColor: LandingTextColor;
  headerButtonTextCustomColor: string | null;
  headerLogoUrl: string | null;
  headerLogoAlt: string | null;
  headerLogoHeight: number;
  footerLogoUrl: string | null;
  footerLogoAlt: string | null;
  footerLogoHeight: number;
}

const GENERAL_DEFAULTS: GeneralSettings = {
  meetingUrl: "",
  slotMinutes: 30,
  leadTimeHours: 24,
  horizonDays: 30,
  notifyEmail: "",
  emailConfirmationNote: "",
  emailSignoff: "Bis dahin,\nKI-Drama",
  headerButtonColor: "accent",
  headerButtonCustomColor: null,
  headerButtonTextColor: "auto",
  headerButtonTextCustomColor: null,
  headerLogoUrl: null,
  headerLogoAlt: null,
  headerLogoHeight: 32,
  footerLogoUrl: null,
  footerLogoAlt: null,
  footerLogoHeight: 32,
};

/**
 * settings hat bewusst keine anon-Policy (siehe docs/supabase_schema.sql).
 * Sowohl der Admin-Bereich als auch öffentliche Seiten (Landing Page,
 * Verfügbarkeits-Engine) lesen deshalb über den admin-Client — dieselbe
 * Begründung wie in lib/queries/availability.ts.
 */
export async function getGeneralSettings(): Promise<GeneralSettings> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error) throw error;

  const map = new Map((data ?? []).map((row) => [row.key, row.value]));
  const asString = (key: string, fallback: string) => {
    const value = map.get(key);
    return typeof value === "string" ? value : fallback;
  };
  const asNumber = (key: string, fallback: number) => {
    const value = map.get(key);
    return typeof value === "number" ? value : fallback;
  };
  const asNullableString = (key: string, fallback: string | null) => {
    const value = map.get(key);
    return typeof value === "string" ? value : fallback;
  };

  return {
    meetingUrl: asString("meeting_url", GENERAL_DEFAULTS.meetingUrl),
    slotMinutes: asNumber("slot_minutes", GENERAL_DEFAULTS.slotMinutes),
    leadTimeHours: asNumber("lead_time_hours", GENERAL_DEFAULTS.leadTimeHours),
    horizonDays: asNumber("horizon_days", GENERAL_DEFAULTS.horizonDays),
    notifyEmail: asString("notify_email", GENERAL_DEFAULTS.notifyEmail),
    emailConfirmationNote: asString(
      "email_confirmation_note",
      GENERAL_DEFAULTS.emailConfirmationNote
    ),
    emailSignoff: asString("email_signoff", GENERAL_DEFAULTS.emailSignoff),
    headerButtonColor: asString(
      "header_button_color",
      GENERAL_DEFAULTS.headerButtonColor
    ) as LandingButtonColor,
    headerButtonCustomColor: asNullableString(
      "header_button_custom_color",
      GENERAL_DEFAULTS.headerButtonCustomColor
    ),
    headerButtonTextColor: asString(
      "header_button_text_color",
      GENERAL_DEFAULTS.headerButtonTextColor
    ) as LandingTextColor,
    headerButtonTextCustomColor: asNullableString(
      "header_button_text_custom_color",
      GENERAL_DEFAULTS.headerButtonTextCustomColor
    ),
    headerLogoUrl: asNullableString(
      "header_logo_url",
      GENERAL_DEFAULTS.headerLogoUrl
    ),
    headerLogoAlt: asNullableString(
      "header_logo_alt",
      GENERAL_DEFAULTS.headerLogoAlt
    ),
    headerLogoHeight: asNumber(
      "header_logo_height",
      GENERAL_DEFAULTS.headerLogoHeight
    ),
    footerLogoUrl: asNullableString(
      "footer_logo_url",
      GENERAL_DEFAULTS.footerLogoUrl
    ),
    footerLogoAlt: asNullableString(
      "footer_logo_alt",
      GENERAL_DEFAULTS.footerLogoAlt
    ),
    footerLogoHeight: asNumber(
      "footer_logo_height",
      GENERAL_DEFAULTS.footerLogoHeight
    ),
  };
}

export async function getLandingPageContent(): Promise<LandingPageContent> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "landing_page")
    .maybeSingle();

  if (error) throw error;
  if (
    !data?.value ||
    typeof data.value !== "object" ||
    Array.isArray(data.value)
  ) {
    return EMPTY_LANDING_CONTENT;
  }

  // Flach mit den Defaults mergen, damit fehlende Felder (z. B. nach einer
  // späteren Erweiterung der Struktur) nicht zu Laufzeitfehlern führen.
  const stored = data.value as unknown as Partial<LandingPageContent>;
  return {
    hero: { ...EMPTY_LANDING_CONTENT.hero, ...stored.hero },
    sections: Array.isArray(stored.sections)
      ? stored.sections.map(normalizeSection)
      : EMPTY_LANDING_CONTENT.sections,
    posts: { ...EMPTY_LANDING_CONTENT.posts, ...stored.posts },
    faq: normalizeFaq(stored.faq),
    closingCta: { ...EMPTY_LANDING_CONTENT.closingCta, ...stored.closingCta },
  };
}

export async function getNavigationContent(): Promise<NavigationContent> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "navigation")
    .maybeSingle();

  if (error) throw error;
  if (
    !data?.value ||
    typeof data.value !== "object" ||
    Array.isArray(data.value)
  ) {
    return DEFAULT_NAVIGATION;
  }

  return normalizeNavigation(data.value as Partial<NavigationContent>);
}
