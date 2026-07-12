import { z } from "zod";

export const mediaCreateSchema = z.object({
  path: z.string().min(1),
  url: z.string().url(),
  alt: z
    .string()
    .trim()
    .min(
      1,
      "Alt-Text ist Pflicht — beschreibe kurz, was auf dem Bild zu sehen ist."
    ),
  caption: z.string().trim().max(300).nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  bytes: z.number().int().positive().nullable(),
});

export const mediaUpdateSchema = z.object({
  id: z.uuid(),
  alt: z
    .string()
    .trim()
    .min(
      1,
      "Alt-Text ist Pflicht — beschreibe kurz, was auf dem Bild zu sehen ist."
    ),
  caption: z.string().trim().max(300).nullable(),
});

export const mediaDeleteSchema = z.object({ id: z.uuid() });

export type MediaCreateInput = z.infer<typeof mediaCreateSchema>;
export type MediaUpdateInput = z.infer<typeof mediaUpdateSchema>;
