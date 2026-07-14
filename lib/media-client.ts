import imageCompression from "browser-image-compression";

const MAX_EDGE_PX = 2000;

export interface CompressedImage {
  file: File;
  width: number;
  height: number;
}

/**
 * Verkleinert ein Bild im Browser auf max. 2000px Kantenlänge und wandelt es
 * nach WebP um, bevor es hochgeladen wird — spart Bandbreite und Storage.
 */
export async function compressImageFile(file: File): Promise<CompressedImage> {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: MAX_EDGE_PX,
    fileType: "image/webp",
    useWebWorker: true,
    initialQuality: 0.85,
  });

  const dimensions = await readImageDimensions(compressed);

  return {
    file: compressed,
    width: dimensions.width,
    height: dimensions.height,
  };
}

/** Auch für GIFs geeignet -- Image() liest bei animierten GIFs die Maße des ersten Frames. */
export function readImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Bildabmessungen konnten nicht gelesen werden."));
    };
    img.src = url;
  });
}

export function readVideoDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({ width: video.videoWidth, height: video.videoHeight });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Videoabmessungen konnten nicht gelesen werden."));
    };
    video.src = url;
  });
}

export interface UploadResult {
  path: string;
  url: string;
}

/**
 * Lädt eine Datei per XMLHttpRequest hoch, damit echte Fortschrittsereignisse
 * verfügbar sind (fetch() bietet das für Uploads nicht zuverlässig).
 */
export function uploadFileWithProgress(
  file: File,
  onProgress: (percent: number) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let body: unknown;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        body = null;
      }

      if (
        xhr.status >= 200 &&
        xhr.status < 300 &&
        body &&
        typeof body === "object"
      ) {
        resolve(body as UploadResult);
      } else {
        const message =
          body && typeof body === "object" && "error" in body
            ? String((body as { error: unknown }).error)
            : "Die Datei konnte nicht hochgeladen werden. Bitte versuche es erneut.";
        reject(new Error(message));
      }
    };

    xhr.onerror = () => {
      reject(
        new Error(
          "Die Datei konnte nicht hochgeladen werden. Prüfe deine Verbindung."
        )
      );
    };

    xhr.send(formData);
  });
}
