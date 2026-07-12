import { z } from "zod";

export const postSaveSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Der Slug darf nicht leer sein.")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Nur Kleinbuchstaben, Ziffern und Bindestriche."
    ),
  excerpt: z.string().trim().max(400),
  category: z.string().trim().min(1, "Bitte eine Kategorie angeben.").max(60),
  tags: z.array(z.string().trim().min(1)).max(20),
  coverUrl: z.string().url().nullable(),
  coverAlt: z.string().trim().max(200).nullable(),
  status: z.enum(["entwurf", "veroeffentlicht"]),
  body: z.record(z.string(), z.unknown()),
});

export type PostSaveInput = z.infer<typeof postSaveSchema>;
