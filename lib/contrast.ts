const HEX_PATTERN = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

export function hexToRgb(hex: string): [number, number, number] | null {
  const match = HEX_PATTERN.exec(hex.trim());
  if (!match) return null;
  return [
    parseInt(match[1], 16),
    parseInt(match[2], 16),
    parseInt(match[3], 16),
  ];
}

function channelLuminance(channel8bit: number): number {
  const c = channel8bit / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map(channelLuminance);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG-Kontrastformel: (L1 + 0.05) / (L2 + 0.05), L1 >= L2. */
export function contrastRatio(hexA: string, hexB: string): number | null {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  if (lA === null || lB === null) return null;
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG AA für normalen Fließtext (Button-Beschriftungen eingeschlossen). */
export const WCAG_AA_RATIO = 4.5;

export function meetsWcagAA(
  foregroundOrBackground: string,
  against: string = "#ffffff"
): boolean {
  const ratio = contrastRatio(foregroundOrBackground, against);
  return ratio !== null && ratio >= WCAG_AA_RATIO;
}
