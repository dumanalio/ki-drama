import type { BookingStatus, LeadSegment, LeadStatus } from "@/types/database";

export type BadgeVariant = "soft" | "success" | "warning" | "danger" | "signal";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  neu: "Neu",
  kontaktiert: "Kontaktiert",
  termin_gebucht: "Termin gebucht",
  gespraech_gefuehrt: "Gespräch geführt",
  kunde: "Kunde",
  kein_interesse: "Kein Interesse",
};

export const LEAD_STATUS_VARIANTS: Record<LeadStatus, BadgeVariant> = {
  neu: "soft",
  kontaktiert: "soft",
  termin_gebucht: "warning",
  gespraech_gefuehrt: "soft",
  kunde: "success",
  kein_interesse: "danger",
};

export const LEAD_SEGMENT_LABELS: Record<LeadSegment, string> = {
  privat: "Privat",
  business: "Unternehmen",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  gebucht: "Gebucht",
  abgesagt: "Abgesagt",
  wahrgenommen: "Wahrgenommen",
  nicht_erschienen: "Nicht erschienen",
};

export const BOOKING_STATUS_VARIANTS: Record<BookingStatus, BadgeVariant> = {
  gebucht: "soft",
  abgesagt: "danger",
  wahrgenommen: "success",
  nicht_erschienen: "warning",
};
