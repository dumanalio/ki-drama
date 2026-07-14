import type { LandingButtonColor, LandingTextColor } from "@/lib/landing-content";

export interface ResolvedButtonStyle {
  variant: "primary" | "accent" | "soft" | "outline";
  style?: { backgroundColor?: string; color?: string };
}

/** Feste Hintergrundfarben der vier Design-Token-Varianten (siehe CLAUDE.md, Buttons). */
export const VARIANT_BACKGROUND_HEX: Record<
  Exclude<LandingButtonColor, "custom">,
  string
> = {
  primary: "#1e1b39",
  accent: "#5b4ee3",
  soft: "#eceafd",
  outline: "#ffffff",
};

/** Tatsächliche Hintergrundfarbe als Hex, egal ob Token oder eigene Farbe -- für Kontrastprüfungen. */
export function resolveButtonBackgroundHex(
  color: LandingButtonColor,
  customColor: string | null
): string {
  if (color === "custom" && customColor) return customColor;
  return VARIANT_BACKGROUND_HEX[color === "custom" ? "primary" : color];
}

/**
 * Löst Farb-Token + optionale eigene Hintergrund-/Schriftfarbe in Button-Props
 * auf. variant bleibt für Größe/Radius/Font-Gewicht aus den CVA-Klassen; die
 * tatsächliche Farbe kommt, wo nötig, per inline style (überschreibt die
 * Klasse zuverlässig -- auch bei :hover, siehe unten).
 */
export function resolveButtonStyle(
  color: LandingButtonColor,
  customColor: string | null,
  textColor: LandingTextColor = "auto",
  textCustomColor: string | null = null
): ResolvedButtonStyle {
  const variant = color === "custom" ? "primary" : color;
  const style: { backgroundColor?: string; color?: string } = {};

  if (color === "custom" && customColor) {
    style.backgroundColor = customColor;
  }

  if (textColor === "custom" && textCustomColor) {
    style.color = textCustomColor;
  } else if (color === "custom" && customColor) {
    // Bisheriges Verhalten: eigener Hintergrund ohne eigene Schriftfarbe
    // bekommt automatisch Weiß (Kontrastprüfung dafür läuft in
    // lib/validation/settings.ts gegen Weiß).
    style.color = "#ffffff";
  }

  return { variant, style: Object.keys(style).length > 0 ? style : undefined };
}
