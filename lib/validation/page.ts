import { z } from "zod";

/**
 * Pfade, die bereits eigene, fest codierte Routen haben (siehe app/(site)/*
 * und app/check/*). Next.js würde eine statische Route ohnehin immer vor
 * app/(site)/[slug] bevorzugen -- diese Liste verhindert zusätzlich, dass
 * eine so benannte Seite unbemerkt unerreichbar angelegt wird.
 */
export const RESERVED_PAGE_SLUGS = [
  "grundlagen",
  "landschaft",
  "news",
  "check",
  "kontakt",
  "impressum",
  "datenschutz",
  "ueber-mich",
  "admin",
  "api",
];

export const pageSaveSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Der Slug darf nicht leer sein.")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Nur Kleinbuchstaben, Ziffern und Bindestriche."
    )
    .refine((slug) => !RESERVED_PAGE_SLUGS.includes(slug), {
      message:
        "Dieser Slug ist für eine feste Seite reserviert. Bitte einen anderen wählen.",
    }),
  status: z.enum(["entwurf", "veroeffentlicht"]),
  // Kommt als JSON-String an (nicht als Objekt) -- siehe lib/validation/post.ts
  // für die Begründung (Next.js verliert sonst verschachtelte Tiptap-Attribute).
  body: z
    .string()
    .min(1)
    .transform((value, ctx) => {
      try {
        return JSON.parse(value) as Record<string, unknown>;
      } catch {
        ctx.addIssue({ code: "custom", message: "Der Inhalt ist ungültig." });
        return z.NEVER;
      }
    }),
});

export type PageSaveInput = z.infer<typeof pageSaveSchema>;
