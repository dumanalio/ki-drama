import { Resend } from "resend";

/**
 * Solange keine eigene Domain bei Resend verifiziert ist, kann nur an die
 * Resend-Kontoadresse zugestellt werden (Resend-Sandbox-Beschränkung).
 */
export const EMAIL_FROM = "KI-Drama <onboarding@resend.dev>";

export function getResendClient(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}
