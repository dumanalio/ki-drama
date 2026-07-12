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
  level: z.enum(["einsteiger", "fortgeschritten"]),
  status: z.enum(["entwurf", "veroeffentlicht"]),
  body: z.record(z.string(), z.unknown()),
});

export const chaptersReorderSchema = z.array(z.uuid()).min(1);

export type ChapterSaveInput = z.infer<typeof chapterSaveSchema>;
