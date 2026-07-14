import { z } from "zod";

import { resolveButtonBackgroundHex } from "@/lib/button-color";
import { meetsWcagAA } from "@/lib/contrast";
import type { LandingButtonColor, LandingTextColor } from "@/lib/landing-content";

const emptyToNull = (value: string) =>
  value.trim().length === 0 ? null : value;

const nullableString = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? emptyToNull(value) : value),
    z.string().max(max).nullable()
  );
const nullableUrl = z.preprocess(
  (value) => (typeof value === "string" ? emptyToNull(value) : value),
  z.string().url().nullable()
);

const nullableHexColor = z.preprocess(
  (value) => (typeof value === "string" ? emptyToNull(value) : value),
  z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Bitte eine gültige Hex-Farbe angeben.")
    .nullable()
);

const buttonColorEnum = z.enum([
  "primary",
  "accent",
  "soft",
  "outline",
  "custom",
]);

const textColorEnum = z.enum(["auto", "custom"]);

const CONTRAST_MESSAGE =
  "Diese Farbe hat zu wenig Kontrast zur Schriftfarbe (WCAG AA verlangt mind. 4.5:1). Bitte eine andere Farbe wählen.";

/**
 * Prüft Hintergrund-/Schriftfarbe eines Buttons gegen WCAG AA und meldet
 * ggf. am angegebenen Pfad. Bei eigener Schriftfarbe wird gegen die
 * tatsächliche Hintergrundfarbe geprüft (Token oder eigene Farbe); bei
 * automatischer Schriftfarbe nur der alte Fall (eigener Hintergrund, dafür
 * automatisch weißer Text).
 */
function refineButtonContrast(
  ctx: z.RefinementCtx,
  color: LandingButtonColor,
  customColor: string | null,
  textColor: LandingTextColor,
  textCustomColor: string | null,
  bgPath: (string | number)[],
  textPath: (string | number)[]
) {
  if (textColor === "custom" && textCustomColor) {
    const backgroundHex = resolveButtonBackgroundHex(color, customColor);
    if (!meetsWcagAA(textCustomColor, backgroundHex)) {
      ctx.addIssue({ code: "custom", path: textPath, message: CONTRAST_MESSAGE });
    }
    return;
  }
  if (color === "custom" && customColor && !meetsWcagAA(customColor)) {
    ctx.addIssue({ code: "custom", path: bgPath, message: CONTRAST_MESSAGE });
  }
}

export const generalSettingsSchema = z
  .object({
    meetingUrl: z
      .string()
      .trim()
      .min(1, "Bitte einen Meeting-Link angeben.")
      .url("Ungültige URL."),
    slotMinutes: z.number().int().min(5).max(240),
    leadTimeHours: z.number().int().min(0).max(720),
    horizonDays: z.number().int().min(1).max(365),
    notifyEmail: z.email("Ungültige E-Mail-Adresse."),
    emailConfirmationNote: z.string().trim().max(2000),
    emailSignoff: z.string().trim().max(500),
    headerButtonColor: buttonColorEnum,
    headerButtonCustomColor: nullableHexColor,
    headerButtonTextColor: textColorEnum,
    headerButtonTextCustomColor: nullableHexColor,
    headerLogoUrl: nullableUrl,
    headerLogoAlt: nullableString(200),
    headerLogoHeight: z.number().int().min(16).max(120),
  })
  .superRefine((settings, ctx) => {
    refineButtonContrast(
      ctx,
      settings.headerButtonColor,
      settings.headerButtonCustomColor,
      settings.headerButtonTextColor,
      settings.headerButtonTextCustomColor,
      ["headerButtonCustomColor"],
      ["headerButtonTextCustomColor"]
    );
  });

const heroSchema = z
  .object({
    eyebrow: nullableString(60),
    title: nullableString(200),
    subtitle: nullableString(400),
    primaryButtonLabel: nullableString(60),
    primaryButtonColor: buttonColorEnum,
    primaryButtonCustomColor: nullableHexColor,
    primaryButtonTextColor: textColorEnum,
    primaryButtonTextCustomColor: nullableHexColor,
    secondaryButtonLabel: nullableString(60),
    secondaryButtonColor: buttonColorEnum,
    secondaryButtonCustomColor: nullableHexColor,
    secondaryButtonTextColor: textColorEnum,
    secondaryButtonTextCustomColor: nullableHexColor,
    imageUrl: nullableUrl,
    imageAlt: nullableString(200),
  })
  .superRefine((hero, ctx) => {
    refineButtonContrast(
      ctx,
      hero.primaryButtonColor,
      hero.primaryButtonCustomColor,
      hero.primaryButtonTextColor,
      hero.primaryButtonTextCustomColor,
      ["primaryButtonCustomColor"],
      ["primaryButtonTextCustomColor"]
    );
    refineButtonContrast(
      ctx,
      hero.secondaryButtonColor,
      hero.secondaryButtonCustomColor,
      hero.secondaryButtonTextColor,
      hero.secondaryButtonTextCustomColor,
      ["secondaryButtonCustomColor"],
      ["secondaryButtonTextCustomColor"]
    );
  });

const closingCtaSchema = z
  .object({
    title: nullableString(200),
    text: nullableString(400),
    buttonLabel: nullableString(60),
    buttonColor: buttonColorEnum,
    buttonCustomColor: nullableHexColor,
    buttonTextColor: textColorEnum,
    buttonTextCustomColor: nullableHexColor,
  })
  .superRefine((cta, ctx) => {
    refineButtonContrast(
      ctx,
      cta.buttonColor,
      cta.buttonCustomColor,
      cta.buttonTextColor,
      cta.buttonTextCustomColor,
      ["buttonCustomColor"],
      ["buttonTextCustomColor"]
    );
  });

const sectionButtonSchema = z
  .object({
    label: nullableString(60),
    href: nullableString(300),
    color: buttonColorEnum,
    customColor: nullableHexColor,
    textColor: textColorEnum,
    textCustomColor: nullableHexColor,
  })
  .nullable()
  .superRefine((button, ctx) => {
    if (!button) return;
    refineButtonContrast(
      ctx,
      button.color,
      button.customColor,
      button.textColor,
      button.textCustomColor,
      ["customColor"],
      ["textCustomColor"]
    );
  });

const landingSectionColumnSchema = z.object({
  id: z.string().min(1),
  imageUrl: nullableUrl,
  imageAlt: nullableString(200),
  title: nullableString(200),
  text: nullableString(400),
  button: sectionButtonSchema,
});

const landingSectionSchema = z.object({
  id: z.string().min(1),
  layout: z.enum(["image-left", "image-right", "image-top", "no-image"]),
  columnCount: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  columns: z.array(landingSectionColumnSchema).max(3),
  eyebrow: nullableString(60),
  title: nullableString(200),
  text: nullableString(600),
  checklistItems: z.array(nullableString(120)).max(6),
  imageUrl: nullableUrl,
  imageAlt: nullableString(200),
  button: sectionButtonSchema,
});

const landingPageContentShape = z.object({
  hero: heroSchema,
  sections: z.array(landingSectionSchema).max(20),
  closingCta: closingCtaSchema,
});

// Kommt als JSON-String an, nicht als Objekt — siehe lib/validation/post.ts:
// Next.js' Server-Action-Serialisierung verliert verschachtelte Attribute
// bei komplexen Objekten (Arrays aus Objekten), wenn sie direkt als Objekt
// übergeben werden. Ein expliziter String-Rundgang umgeht das zuverlässig.
export const landingPageContentSchema = z
  .string()
  .min(1)
  .transform((value, ctx) => {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "Der Inhalt ist ungültig." });
      return z.NEVER;
    }
  })
  .pipe(landingPageContentShape);

const navLinkSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1, "Bitte eine Beschriftung angeben.").max(60),
  href: z.string().trim().min(1, "Bitte ein Ziel angeben.").max(300),
  visible: z.boolean(),
});

const footerColumnSchema = z.object({
  id: z.string().min(1),
  heading: z
    .string()
    .trim()
    .min(1, "Bitte eine Spaltenüberschrift angeben.")
    .max(60),
  links: z.array(navLinkSchema).max(10),
});

const navigationContentShape = z.object({
  header: z.array(navLinkSchema).max(10),
  footerText: z.string().trim().max(300),
  footerColumns: z.array(footerColumnSchema).max(4),
});

// Derselbe JSON-String-Rundgang wie landingPageContentSchema -- aus demselben
// Grund (verschachtelte Arrays verlieren sonst Attribute).
export const navigationContentSchema = z
  .string()
  .min(1)
  .transform((value, ctx) => {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "Der Inhalt ist ungültig." });
      return z.NEVER;
    }
  })
  .pipe(navigationContentShape);

const footerSettingsShape = z.object({
  footerLogoUrl: nullableUrl,
  footerLogoAlt: nullableString(200),
  footerLogoHeight: z.number().int().min(16).max(120),
  footerText: z.string().trim().max(300),
  footerColumns: z.array(footerColumnSchema).max(4),
});

// Derselbe JSON-String-Rundgang wie landingPageContentSchema -- aus demselben
// Grund (verschachtelte Arrays verlieren sonst Attribute).
export const footerSettingsSchema = z
  .string()
  .min(1)
  .transform((value, ctx) => {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "Der Inhalt ist ungültig." });
      return z.NEVER;
    }
  })
  .pipe(footerSettingsShape);

export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;
export type LandingPageContentInput = z.infer<typeof landingPageContentShape>;
export type NavigationContentInput = z.infer<typeof navigationContentShape>;
export type FooterSettingsInput = z.infer<typeof footerSettingsShape>;
