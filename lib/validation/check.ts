import { z } from "zod";

export const checkAnswerValueSchema = z.union([
  z.string().min(1),
  z.array(z.string().min(1)).min(1),
]);

/**
 * Validiert nur die Kontaktfelder — für die clientseitige Vorprüfung, bevor
 * die Turnstile-Challenge ausgeführt wird.
 */
export const checkContactSchema = z
  .object({
    segment: z.enum(["privat", "business"]),
    name: z.string().trim().min(2, "Bitte gib deinen Namen ein."),
    email: z.email("Das sieht nicht nach einer gültigen E-Mail-Adresse aus."),
    company: z.string().trim().min(1).optional(),
    consent: z.literal(true, "Bitte stimme der Datenschutzerklärung zu."),
  })
  .superRefine((data, ctx) => {
    if (data.segment === "business" && !data.company) {
      ctx.addIssue({
        code: "custom",
        path: ["company"],
        message: "Bitte gib deinen Firmennamen ein.",
      });
    }
  });

/**
 * Vollständiges, serverseitig autoritatives Schema für POST /api/check.
 */
export const checkSubmitSchema = z
  .object({
    sessionId: z.string().min(1),
    segment: z.enum(["privat", "business"]),
    answers: z.record(z.string(), checkAnswerValueSchema),
    name: z.string().trim().min(2, "Bitte gib deinen Namen ein."),
    email: z.email("Das sieht nicht nach einer gültigen E-Mail-Adresse aus."),
    company: z.string().trim().min(1).optional(),
    consent: z.literal(true, "Bitte stimme der Datenschutzerklärung zu."),
    turnstileToken: z
      .string()
      .min(1, "Sicherheitsprüfung fehlgeschlagen. Bitte versuche es erneut."),
  })
  .superRefine((data, ctx) => {
    if (data.segment === "business" && !data.company) {
      ctx.addIssue({
        code: "custom",
        path: ["company"],
        message: "Bitte gib deinen Firmennamen ein.",
      });
    }
  });

export type CheckContactInput = z.infer<typeof checkContactSchema>;
export type CheckSubmitInput = z.infer<typeof checkSubmitSchema>;
