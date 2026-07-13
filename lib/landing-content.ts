export type LandingButtonColor =
  | "primary"
  | "accent"
  | "soft"
  | "outline"
  | "custom";

export interface LandingHero {
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  primaryButtonLabel: string | null;
  primaryButtonColor: LandingButtonColor;
  primaryButtonCustomColor: string | null;
  secondaryButtonLabel: string | null;
  secondaryButtonColor: LandingButtonColor;
  secondaryButtonCustomColor: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}

export type LandingSectionLayout =
  | "image-left"
  | "image-right"
  | "image-top"
  | "no-image";

export interface LandingSectionButton {
  label: string | null;
  href: string | null;
  color: LandingButtonColor;
  /** Nur relevant, wenn color === "custom". Hex, z. B. "#5b4ee3". */
  customColor: string | null;
}

export type LandingSectionColumnCount = 1 | 2 | 3;

export interface LandingSectionColumn {
  /** Stabile Client-ID für React-Keys, kein DB-Primärschlüssel. */
  id: string;
  imageUrl: string | null;
  imageAlt: string | null;
  title: string | null;
  text: string | null;
  button: LandingSectionButton | null;
}

export interface LandingSection {
  /** Stabile Client-ID für Drag&Drop/React-Keys, kein DB-Primärschlüssel. */
  id: string;
  /** Nur relevant, wenn columnCount === 1. */
  layout: LandingSectionLayout;
  columnCount: LandingSectionColumnCount;
  /** Nur relevant, wenn columnCount > 1 -- ein Eintrag pro Spalte. */
  columns: LandingSectionColumn[];
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
  buttonColor: LandingButtonColor;
  buttonCustomColor: string | null;
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
    primaryButtonColor: "accent",
    primaryButtonCustomColor: null,
    secondaryButtonLabel: null,
    secondaryButtonColor: "soft",
    secondaryButtonCustomColor: null,
    imageUrl: null,
    imageAlt: null,
  },
  sections: [],
  closingCta: {
    title: null,
    text: null,
    buttonLabel: null,
    buttonColor: "accent",
    buttonCustomColor: null,
  },
};

export function createEmptySection(): LandingSection {
  return {
    id: crypto.randomUUID(),
    layout: "image-left",
    columnCount: 1,
    columns: [],
    eyebrow: null,
    title: null,
    text: null,
    checklistItems: [],
    imageUrl: null,
    imageAlt: null,
    button: null,
  };
}

export function createEmptyColumn(): LandingSectionColumn {
  return {
    id: crypto.randomUUID(),
    imageUrl: null,
    imageAlt: null,
    title: null,
    text: null,
    button: null,
  };
}

/**
 * Ergänzt fehlende Felder (z. B. columnCount/columns aus einer späteren
 * Erweiterung) mit Defaults, damit ältere gespeicherte Abschnitte nicht zu
 * Laufzeitfehlern führen.
 */
export function normalizeSection(
  section: Partial<LandingSection>
): LandingSection {
  const empty = createEmptySection();
  return {
    ...empty,
    ...section,
    columnCount: section.columnCount ?? empty.columnCount,
    columns: Array.isArray(section.columns) ? section.columns : empty.columns,
    checklistItems: Array.isArray(section.checklistItems)
      ? section.checklistItems
      : empty.checklistItems,
  };
}

/** Liefert value, wenn gesetzt und nicht leer — sonst den Fallback-Text aus dem Code. */
export function pick(
  value: string | null | undefined,
  fallback: string
): string {
  return value && value.trim().length > 0 ? value : fallback;
}
