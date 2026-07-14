/** Gemeinsame Konstanten für Medien-Uploads -- clientseitige Vorprüfung UND serverseitige Validierung. */

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20 MB

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"] as const;

export const ACCEPTED_UPLOAD_TYPES: readonly string[] = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_VIDEO_TYPES,
];

export function isVideoMimeType(type: string): boolean {
  return (ACCEPTED_VIDEO_TYPES as readonly string[]).includes(type);
}

export function isGifMimeType(type: string): boolean {
  return type === "image/gif";
}

export function extensionForMimeType(type: string): string | null {
  switch (type) {
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "video/mp4":
      return "mp4";
    case "video/webm":
      return "webm";
    default:
      return null;
  }
}

/** Erkennt eine hochgeladene Videodatei an der Endung -- media hat kein eigenes "kind"-Feld. */
export function isVideoPath(pathOrUrl: string): boolean {
  return /\.(mp4|webm)(\?|$)/i.test(pathOrUrl);
}
