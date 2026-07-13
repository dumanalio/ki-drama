import type { LandingButtonColor } from "@/lib/landing-content";

export interface ResolvedButtonStyle {
  variant: "primary" | "accent" | "soft" | "outline";
  style?: { backgroundColor: string; color: string };
}

/**
 * Löst Farb-Token + optionale eigene Farbe in Button-Props auf. Bei "custom"
 * bleibt variant="primary" für Größe/Radius/Font-Gewicht aus den CVA-Klassen,
 * die eigentliche Farbe kommt per inline style (überschreibt die Klasse zuverlässig).
 */
export function resolveButtonStyle(
  color: LandingButtonColor,
  customColor: string | null
): ResolvedButtonStyle {
  if (color === "custom" && customColor) {
    return {
      variant: "primary",
      style: { backgroundColor: customColor, color: "#ffffff" },
    };
  }
  return { variant: color === "custom" ? "primary" : color };
}
