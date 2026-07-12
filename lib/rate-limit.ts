/**
 * Einfacher In-Memory-Zähler (siehe docs/01_Claude-Code-Prompts.md, Phase 4).
 * Läuft pro Serverprozess — auf Serverless-Plattformen mit mehreren Instanzen
 * (z. B. Vercel) ist das Limit daher nicht global garantiert, für den
 * jetzigen Stand aber ausreichend.
 */

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 5;

const hits = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  maxRequests: number = MAX_REQUESTS,
  windowMs: number = WINDOW_MS
): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter(
    (timestamp) => now - timestamp < windowMs
  );

  if (timestamps.length >= maxRequests) {
    hits.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return true;
}
