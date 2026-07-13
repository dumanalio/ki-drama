import { z } from "zod";

const optionSchema = z.object({
  label: z.string().trim().min(1, "Bitte eine Beschriftung angeben."),
  description: z.string().trim().max(200).nullable(),
  iconUrl: z.string().url().nullable(),
  iconAlt: z.string().trim().max(200).nullable(),
});

export const questionSaveSchema = z.object({
  id: z.uuid(),
  type: z.enum(["single", "multi", "scale", "text"]),
  segment: z.enum(["alle", "privat", "business"]),
  title: z.string().trim().min(1, "Bitte einen Titel angeben.").max(200),
  hint: z.string().trim().max(300).nullable(),
  options: z.array(optionSchema).max(20),
  iconAlign: z.enum(["left", "center", "right"]),
  textAlign: z.enum(["left", "center", "right"]),
  required: z.boolean(),
  active: z.boolean(),
});

export const questionsReorderSchema = z.array(z.uuid()).min(1);

export type QuestionSaveInput = z.infer<typeof questionSaveSchema>;
