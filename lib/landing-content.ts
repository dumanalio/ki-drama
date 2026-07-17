import { DEFAULT_VIDEO_PLAYBACK_MODE, type VideoPlaybackMode } from "@/lib/media-constants";

export type LandingButtonColor =
  | "primary"
  | "accent"
  | "soft"
  | "outline"
  | "custom";

/** "auto" = die zur Variante gehörende Standard-Schriftfarbe, "custom" = eigene Hex-Farbe. */
export type LandingTextColor = "auto" | "custom";

export type LandingHeroTitleSize = "small" | "medium" | "large";

/** Tailwind-Klassen je Größe (Desktop/Mobil) -- "large" entspricht der bisherigen festen Größe. */
export const HERO_TITLE_SIZE_CLASSES: Record<LandingHeroTitleSize, string> = {
  small: "text-[26px] md:text-[38px]",
  medium: "text-[30px] md:text-[44px]",
  large: "text-[34px] md:text-[52px]",
};

export interface LandingHero {
  eyebrow: string | null;
  title: string | null;
  titleSize: LandingHeroTitleSize;
  subtitle: string | null;
  primaryButtonLabel: string | null;
  primaryButtonColor: LandingButtonColor;
  primaryButtonCustomColor: string | null;
  primaryButtonTextColor: LandingTextColor;
  primaryButtonTextCustomColor: string | null;
  secondaryButtonLabel: string | null;
  secondaryButtonColor: LandingButtonColor;
  secondaryButtonCustomColor: string | null;
  secondaryButtonTextColor: LandingTextColor;
  secondaryButtonTextCustomColor: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  /** Nur relevant, wenn imageUrl ein hochgeladenes Video (MP4/WebM) ist. */
  imageVideoPlaybackMode: VideoPlaybackMode;
}

export type LandingSectionLayout =
  | "image-left"
  | "image-right"
  | "image-top"
  | "image-between"
  | "image-overlay"
  | "no-image";

export interface LandingSectionButton {
  label: string | null;
  href: string | null;
  color: LandingButtonColor;
  /** Nur relevant, wenn color === "custom". Hex, z. B. "#5b4ee3". */
  customColor: string | null;
  textColor: LandingTextColor;
  /** Nur relevant, wenn textColor === "custom". Hex, z. B. "#1e1b39". */
  textCustomColor: string | null;
}

export type LandingSectionColumnCount = 1 | 2 | 3;

export interface LandingSectionColumn {
  /** Stabile Client-ID für React-Keys, kein DB-Primärschlüssel. */
  id: string;
  imageUrl: string | null;
  imageAlt: string | null;
  imageVideoPlaybackMode: VideoPlaybackMode;
  title: string | null;
  text: string | null;
  button: LandingSectionButton | null;
}

export type LandingSectionTextLayout = "standard" | "two-column";
export type LandingSectionColumnAlign = "top" | "center";

export interface LandingSection {
  /** Stabile Client-ID für Drag&Drop/React-Keys, kein DB-Primärschlüssel. */
  id: string;
  /** Nur relevant, wenn columnCount === 1. */
  layout: LandingSectionLayout;
  /** Nur relevant, wenn layout === "no-image". */
  textLayout: LandingSectionTextLayout;
  /** Nur relevant, wenn textLayout === "two-column". */
  columnAlign: LandingSectionColumnAlign;
  columnCount: LandingSectionColumnCount;
  /** Nur relevant, wenn columnCount > 1 -- ein Eintrag pro Spalte. */
  columns: LandingSectionColumn[];
  eyebrow: string | null;
  title: string | null;
  text: string | null;
  checklistItems: (string | null)[];
  imageUrl: string | null;
  imageAlt: string | null;
  imageVideoPlaybackMode: VideoPlaybackMode;
  button: LandingSectionButton | null;
}

export interface LandingClosingCta {
  title: string | null;
  titleColor: LandingTextColor;
  /** Nur relevant, wenn titleColor === "custom". Hex, z. B. "#ffffff". */
  titleCustomColor: string | null;
  text: string | null;
  buttonLabel: string | null;
  buttonColor: LandingButtonColor;
  buttonCustomColor: string | null;
  buttonTextColor: LandingTextColor;
  buttonTextCustomColor: string | null;
}

export type FaqDisplayStyle = "accordion" | "grid" | "numbered";

export interface LandingFaqItem {
  /** Stabile Client-ID für Drag&Drop/React-Keys, kein DB-Primärschlüssel. */
  id: string;
  question: string | null;
  answer: string | null;
}

export interface LandingFaq {
  title: string | null;
  displayStyle: FaqDisplayStyle;
  items: LandingFaqItem[];
}

export interface LandingPageContent {
  hero: LandingHero;
  sections: LandingSection[];
  faq: LandingFaq;
  closingCta: LandingClosingCta;
}

export const EMPTY_LANDING_CONTENT: LandingPageContent = {
  hero: {
    eyebrow: null,
    title: null,
    titleSize: "large",
    subtitle:
      "Verstehe, wie KI funktioniert, sieh dir die aktuelle Tool-Landschaft an und finde in einem kurzen Gespräch heraus, wo du anfangen kannst.",
    primaryButtonLabel: null,
    primaryButtonColor: "accent",
    primaryButtonCustomColor: null,
    primaryButtonTextColor: "auto",
    primaryButtonTextCustomColor: null,
    secondaryButtonLabel: null,
    secondaryButtonColor: "soft",
    secondaryButtonCustomColor: null,
    secondaryButtonTextColor: "auto",
    secondaryButtonTextCustomColor: null,
    imageUrl: null,
    imageAlt: null,
    imageVideoPlaybackMode: DEFAULT_VIDEO_PLAYBACK_MODE,
  },
  sections: [],
  faq: {
    title: null,
    displayStyle: "accordion",
    items: [],
  },
  closingCta: {
    title: null,
    titleColor: "auto",
    titleCustomColor: null,
    text: null,
    buttonLabel: null,
    buttonColor: "accent",
    buttonCustomColor: null,
    buttonTextColor: "auto",
    buttonTextCustomColor: null,
  },
};

export function createEmptySection(): LandingSection {
  return {
    id: crypto.randomUUID(),
    layout: "image-left",
    textLayout: "standard",
    columnAlign: "top",
    columnCount: 1,
    columns: [],
    eyebrow: null,
    title: null,
    text: null,
    checklistItems: [],
    imageUrl: null,
    imageAlt: null,
    imageVideoPlaybackMode: DEFAULT_VIDEO_PLAYBACK_MODE,
    button: null,
  };
}

export function createEmptyColumn(): LandingSectionColumn {
  return {
    id: crypto.randomUUID(),
    imageUrl: null,
    imageAlt: null,
    imageVideoPlaybackMode: DEFAULT_VIDEO_PLAYBACK_MODE,
    title: null,
    text: null,
    button: null,
  };
}

export function createEmptyFaqItem(): LandingFaqItem {
  return {
    id: crypto.randomUUID(),
    question: null,
    answer: null,
  };
}

/** Ergänzt fehlende Felder (z. B. aus einer späteren Erweiterung) mit Defaults. */
export function normalizeFaq(faq: Partial<LandingFaq> | null | undefined): LandingFaq {
  const empty = EMPTY_LANDING_CONTENT.faq;
  if (!faq) return empty;
  return {
    title: faq.title ?? empty.title,
    displayStyle: faq.displayStyle ?? empty.displayStyle,
    items: Array.isArray(faq.items)
      ? faq.items.map((item) => ({ ...createEmptyFaqItem(), ...item }))
      : empty.items,
  };
}

/** Ergänzt fehlende Button-Felder (z. B. textColor aus einer späteren Erweiterung) mit Defaults. */
export function normalizeButton(
  button: Partial<LandingSectionButton> | null | undefined
): LandingSectionButton | null {
  if (!button) return null;
  return {
    label: button.label ?? null,
    href: button.href ?? null,
    color: button.color ?? "soft",
    customColor: button.customColor ?? null,
    textColor: button.textColor ?? "auto",
    textCustomColor: button.textCustomColor ?? null,
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
    columns: Array.isArray(section.columns)
      ? section.columns.map((column) => ({
          ...createEmptyColumn(),
          ...column,
          button: normalizeButton(column.button),
        }))
      : empty.columns,
    checklistItems: Array.isArray(section.checklistItems)
      ? section.checklistItems
      : empty.checklistItems,
    button: normalizeButton(section.button),
  };
}

/** Trennt Freitext bei Leerzeilen in einzelne Absätze (für das zweispaltige Textlayout). */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

/** Liefert value, wenn gesetzt und nicht leer — sonst den Fallback-Text aus dem Code. */
export function pick(
  value: string | null | undefined,
  fallback: string
): string {
  return value && value.trim().length > 0 ? value : fallback;
}
