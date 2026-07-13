import { z } from "zod";

import { meetsWcagAA } from "@/lib/contrast";

export const generalSettingsSchema = z.object({
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
});

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

const heroSchema = z.object({
  eyebrow: nullableString(60),
  title: nullableString(200),
  subtitle: nullableString(400),
  primaryButtonLabel: nullableString(60),
  secondaryButtonLabel: nullableString(60),
  imageUrl: nullableUrl,
  imageAlt: nullableString(200),
});

const closingCtaSchema = z.object({
  title: nullableString(200),
  text: nullableString(400),
  buttonLabel: nullableString(60),
});

const nullableHexColor = z.preprocess(
  (value) => (typeof value === "string" ? emptyToNull(value) : value),
  z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Bitte eine gültige Hex-Farbe angeben.")
    .nullable()
);

const sectionButtonSchema = z
  .object({
    label: nullableString(60),
    href: nullableString(300),
    color: z.enum(["primary", "accent", "soft", "outline", "custom"]),
    customColor: nullableHexColor,
  })
  .nullable()
  .refine(
    (button) =>
      !button ||
      button.color !== "custom" ||
      !button.customColor ||
      meetsWcagAA(button.customColor),
    {
      message:
        "Diese Farbe hat zu wenig Kontrast zu weißem Text (WCAG AA verlangt mind. 4.5:1). Bitte eine dunklere Farbe wählen.",
    }
  );

const landingSectionSchema = z.object({
  id: z.string().min(1),
  layout: z.enum(["image-left", "image-right", "image-top", "no-image"]),
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

export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;
export type LandingPageContentInput = z.infer<typeof landingPageContentShape>;
