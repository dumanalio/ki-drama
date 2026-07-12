import { z } from "zod";

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

const problemCardSchema = z.object({
  title: nullableString(80),
  text: nullableString(300),
});

const splitSectionSchema = z.object({
  eyebrow: nullableString(60),
  title: nullableString(200),
  text: nullableString(500),
  checklistItems: z.array(nullableString(120)).length(2),
  imageUrl: nullableUrl,
  imageAlt: nullableString(200),
});

const closingCtaSchema = z.object({
  title: nullableString(200),
  text: nullableString(400),
  buttonLabel: nullableString(60),
});

const landingPageContentShape = z.object({
  hero: heroSchema,
  problemCards: z.array(problemCardSchema).length(3),
  splitSections: z.array(splitSectionSchema).length(2),
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
