import type { z } from "zod";

/**
 * Baut aus dem ersten Zod-Issue eine für Admins lesbare Fehlermeldung inkl.
 * Feldname, z. B. "Header-Logo: Ungültige URL." statt nur "Ungültige URL.".
 * `labels` bildet Pfad-Segmente (Objekt-Keys) auf deutsche Bezeichnungen ab;
 * unbekannte Segmente werden roh angezeigt, Array-Indizes als "#n".
 */
export function formatZodError(
  error: z.ZodError,
  labels: Record<string, string> = {}
): string {
  const issue = error.issues[0];
  if (!issue) return "Die Angaben sind ungültig.";

  const parts = issue.path.map((segment) =>
    typeof segment === "number"
      ? `#${segment + 1}`
      : (labels[String(segment)] ?? String(segment))
  );
  const location = parts.join(" → ");
  return location ? `${location}: ${issue.message}` : issue.message;
}
