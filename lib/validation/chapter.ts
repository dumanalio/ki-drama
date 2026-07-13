import { z } from "zod";

export const chapterSaveSchema = z.object({
  id: z.uuid(),
  slug: z
    .string()
    .trim()
    .min(1, "Der Slug darf nicht leer sein.")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Nur Kleinbuchstaben, Ziffern und Bindestriche."
    ),
  title: z.string().trim().max(200),
  summary: z.string().trim().max(400),
  coverUrl: z.string().url().nullable(),
  coverAlt: z.string().trim().max(200).nullable(),
  level: z.enum(["einsteiger", "fortgeschritten"]),
  status: z.enum(["entwurf", "veroeffentlicht"]),
  // Kommt als JSON-String an, nicht als Objekt — siehe lib/validation/post.ts
  // für die Begründung (Server-Action-Serialisierung verliert sonst
  // verschachtelte Tiptap-Node-Attribute wie die Bild-Attribute).
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

export const chaptersReorderSchema = z.array(z.uuid()).min(1);

export type ChapterSaveInput = z.infer<typeof chapterSaveSchema>;
