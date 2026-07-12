export interface LandingHero {
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  primaryButtonLabel: string | null;
  secondaryButtonLabel: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}

export interface LandingProblemCard {
  title: string | null;
  text: string | null;
}

export interface LandingSplitSection {
  eyebrow: string | null;
  title: string | null;
  text: string | null;
  checklistItems: (string | null)[];
  imageUrl: string | null;
  imageAlt: string | null;
}

export interface LandingClosingCta {
  title: string | null;
  text: string | null;
  buttonLabel: string | null;
}

export interface LandingPageContent {
  hero: LandingHero;
  problemCards: LandingProblemCard[];
  splitSections: LandingSplitSection[];
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
  problemCards: [
    { title: null, text: null },
    { title: null, text: null },
    { title: null, text: null },
  ],
  splitSections: [
    {
      eyebrow: null,
      title: null,
      text: null,
      checklistItems: [null, null],
      imageUrl: null,
      imageAlt: null,
    },
    {
      eyebrow: null,
      title: null,
      text: null,
      checklistItems: [null, null],
      imageUrl: null,
      imageAlt: null,
    },
  ],
  closingCta: { title: null, text: null, buttonLabel: null },
};

/** Liefert value, wenn gesetzt und nicht leer — sonst den Fallback-Text aus dem Code. */
export function pick(
  value: string | null | undefined,
  fallback: string
): string {
  return value && value.trim().length > 0 ? value : fallback;
}
