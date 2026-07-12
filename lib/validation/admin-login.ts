import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.email("Das sieht nicht nach einer gültigen E-Mail-Adresse aus."),
  password: z.string().min(1, "Bitte gib dein Passwort ein."),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
