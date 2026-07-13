export interface LandingHero {
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  primaryButtonLabel: string | null;
  secondaryButtonLabel: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}

export type LandingSectionLayout =
  | "image-left"
  | "image-right"
  | "image-top"
  | "no-image";

export type LandingButtonColor =
  | "primary"
  | "accent"
  | "soft"
  | "outline"
  | "custom";

export interface LandingSectionButton {
  label: string | null;
  href: string | null;
  color: LandingButtonColor;
  /** Nur relevant, wenn color === "custom". Hex, z. B. "#5b4ee3". */
  customColor: string | null;
}

export interface LandingSection {
  /** Stabile Client-ID für Drag&Drop/React-Keys, kein DB-Primärschlüssel. */
  id: string;
  layout: LandingSectionLayout;
  eyebrow: string | null;
  title: string | null;
  text: string | null;
  checklistItems: (string | null)[];
  imageUrl: string | null;
  imageAlt: string | null;
  button: LandingSectionButton | null;
}

export interface LandingClosingCta {
  title: string | null;
  text: string | null;
  buttonLabel: string | null;
}

export interface LandingPageContent {
  hero: LandingHero;
  sections: LandingSection[];
  closingCta: LandingClosingCta;
}

export const EMPTY_LANDING_CONTENT: LandingPageContent = {
  hero: {
    eyebrow: null,
    title: null,
    subtitle: null,
    primaryButtonLabel: null,
    secondaryButtonLabel: null,
    imageUrl: null,
    imageAlt: null,
  },
  sections: [],
  closingCta: { title: null, text: null, buttonLabel: null },
};

export function createEmptySection(): LandingSection {
  return {
    id: crypto.randomUUID(),
    layout: "image-left",
    eyebrow: null,
    title: null,
    text: null,
    checklistItems: [],
    imageUrl: null,
    imageAlt: null,
    button: null,
  };
}

/** Liefert value, wenn gesetzt und nicht leer — sonst den Fallback-Text aus dem Code. */
export function pick(
  value: string | null | undefined,
  fallback: string
): string {
  return value && value.trim().length > 0 ? value : fallback;
}
