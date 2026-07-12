import { z } from "zod";

const emptyToNull = (value: string) =>
  value.trim().length === 0 ? null : value;

export const toolSaveSchema = z.object({
  id: z.uuid(),
  slug: z
    .string()
    .trim()
    .min(1, "Der Slug darf nicht leer sein.")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Nur Kleinbuchstaben, Ziffern und Bindestriche."
    ),
  name: z.string().trim().min(1, "Bitte einen Namen angeben.").max(120),
  vendor: z.preprocess(
    (value) => (typeof value === "string" ? emptyToNull(value) : value),
    z.string().max(120).nullable()
  ),
  category: z.string().trim().min(1, "Bitte eine Kategorie angeben.").max(60),
  summary: z
    .string()
    .trim()
    .min(1, "Bitte eine kurze Beschreibung angeben.")
    .max(400),
  goodFor: z.array(z.string().trim().min(1)).max(20),
  watchOut: z.preprocess(
    (value) => (typeof value === "string" ? emptyToNull(value) : value),
    z.string().max(500).nullable()
  ),
  logoUrl: z.preprocess(
    (value) => (typeof value === "string" ? emptyToNull(value) : value),
    z.string().url().nullable()
  ),
  website: z.preprocess(
    (value) => (typeof value === "string" ? emptyToNull(value) : value),
    z.string().url().nullable()
  ),
  priceHint: z.preprocess(
    (value) => (typeof value === "string" ? emptyToNull(value) : value),
    z.string().max(120).nullable()
  ),
  status: z.enum(["entwurf", "veroeffentlicht"]),
});

export const toolsReorderSchema = z.array(z.uuid()).min(1);

export type ToolSaveInput = z.infer<typeof toolSaveSchema>;
