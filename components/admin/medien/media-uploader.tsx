"use client";

import * as React from "react";
import { AlertTriangle, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { ImageCropModal } from "@/components/admin/medien/image-crop-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { createMediaRecord, discardUploadedFile } from "@/lib/actions/media";
import {
  compressImageFile,
  readImageDimensions,
  readVideoDimensions,
  uploadFileWithProgress,
} from "@/lib/media-client";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  isGifMimeType,
  isVideoMimeType,
  MAX_UPLOAD_BYTES,
} from "@/lib/media-constants";
import type { Media } from "@/types/database";

export type MediaAccept = "image" | "video" | "all";

interface PendingUpload {
  id: string;
  kind: "image" | "video";
  previewUrl: string;
  progress: number;
  status: "compressing" | "uploading" | "awaiting-alt" | "saving" | "error";
  error?: string;
  path?: string;
  url?: string;
  width?: number;
  height?: number;
  bytes?: number;
  alt: string;
  caption: string;
}

function createLocalId(): string {
  return `pending-${Math.random().toString(36).slice(2)}`;
}

function acceptedTypesFor(accept: MediaAccept): readonly string[] {
  if (accept === "image") return ACCEPTED_IMAGE_TYPES;
  if (accept === "video") return ACCEPTED_VIDEO_TYPES;
  return [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];
}

function formatMaxSize(): string {
  return `${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB`;
}

export function MediaUploader({
  onSaved,
  accept = "all",
  crop = false,
}: {
  onSaved: (media: Media) => void;
  accept?: MediaAccept;
  /** Zeigt vor dem Hochladen einen Zuschneide-Schritt (nur für einzelne, nicht-animierte Bilder). */
  crop?: boolean;
}) {
  const [pending, setPending] = React.useState<PendingUpload[]>([]);
  const [dragActive, setDragActive] = React.useState(false);
  const [cropTarget, setCropTarget] = React.useState<{
    file: File;
    objectUrl: string;
  } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const acceptedTypes = acceptedTypesFor(accept);

  function patchPending(id: string, patch: Partial<PendingUpload>) {
    setPending((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function removePending(id: string) {
    setPending((prev) => prev.filter((item) => item.id !== id));
  }

  function enqueueFile(file: File) {
    const id = createLocalId();
    const kind = isVideoMimeType(file.type) ? "video" : "image";

    if (file.size > MAX_UPLOAD_BYTES) {
      setPending((prev) => [
        ...prev,
        {
          id,
          kind,
          previewUrl: "",
          progress: 0,
          status: "error",
          error: `Die Datei ist zu groß (maximal ${formatMaxSize()}).`,
          alt: "",
          caption: "",
        },
      ]);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPending((prev) => [
      ...prev,
      {
        id,
        kind,
        previewUrl,
        progress: 0,
        status: kind === "video" ? "uploading" : "compressing",
        alt: "",
        caption: "",
      },
    ]);

    void processUpload(id, file, previewUrl, kind);
  }

  function handleFiles(files: FileList | File[]) {
    const validFiles = Array.from(files).filter((file) =>
      acceptedTypes.includes(file.type)
    );

    if (crop) {
      // Nur die erste Datei -- der Zuschneide-Schritt ist für einen
      // gezielten Einzel-Upload gedacht (z. B. Logo), nicht für Stapel.
      const file = validFiles[0];
      if (!file) return;
      if (file.size > MAX_UPLOAD_BYTES) {
        toast.error(`Die Datei ist zu groß (maximal ${formatMaxSize()}).`);
        return;
      }
      if (isGifMimeType(file.type)) {
        // GIF zuschneiden würde die Animation auf ein Standbild reduzieren.
        enqueueFile(file);
        return;
      }
      setCropTarget({ file, objectUrl: URL.createObjectURL(file) });
      return;
    }

    for (const file of validFiles) {
      enqueueFile(file);
    }
  }

  async function processUpload(
    id: string,
    file: File,
    originalPreviewUrl: string,
    kind: "image" | "video"
  ) {
    try {
      // Videos und GIFs unverändert hochladen: Komprimierung würde die
      // Animation (GIF) zerstören bzw. ist für Videos nicht implementiert.
      if (kind === "video" || isGifMimeType(file.type)) {
        const dimensions =
          kind === "video"
            ? await readVideoDimensions(file)
            : await readImageDimensions(file);
        patchPending(id, {
          status: "uploading",
          width: dimensions.width,
          height: dimensions.height,
          bytes: file.size,
        });

        const result = await uploadFileWithProgress(file, (percent) => {
          patchPending(id, { progress: percent });
        });

        patchPending(id, {
          status: "awaiting-alt",
          path: result.path,
          url: result.url,
        });
        return;
      }

      const compressed = await compressImageFile(file);
      URL.revokeObjectURL(originalPreviewUrl);
      const compressedPreviewUrl = URL.createObjectURL(compressed.file);
      patchPending(id, {
        previewUrl: compressedPreviewUrl,
        status: "uploading",
        width: compressed.width,
        height: compressed.height,
        bytes: compressed.file.size,
      });

      const result = await uploadFileWithProgress(
        compressed.file,
        (percent) => {
          patchPending(id, { progress: percent });
        }
      );

      patchPending(id, {
        status: "awaiting-alt",
        path: result.path,
        url: result.url,
      });
    } catch (error) {
      patchPending(id, {
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Die Datei konnte nicht verarbeitet werden.",
      });
    }
  }

  async function handleDiscard(item: PendingUpload) {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    removePending(item.id);
    if (item.path) {
      await discardUploadedFile(item.path);
    }
  }

  async function handleSave(item: PendingUpload) {
    if (!item.path || !item.url) return;
    if (item.alt.trim().length === 0) {
      patchPending(item.id, { error: "Alt-Text ist Pflicht." });
      return;
    }

    patchPending(item.id, { status: "saving", error: undefined });

    const result = await createMediaRecord({
      path: item.path,
      url: item.url,
      alt: item.alt.trim(),
      caption: item.caption.trim().length > 0 ? item.caption.trim() : null,
      width: item.width ?? null,
      height: item.height ?? null,
      bytes: item.bytes ?? null,
    });

    if (!result.ok) {
      patchPending(item.id, { status: "awaiting-alt", error: result.error });
      toast.error(result.error);
      return;
    }

    toast.success(
      item.kind === "video"
        ? "Video in der Bibliothek gespeichert"
        : "Bild in der Bibliothek gespeichert"
    );
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    removePending(item.id);
    onSaved({
      id: result.id,
      path: item.path,
      url: item.url,
      alt: item.alt.trim(),
      caption: item.caption.trim().length > 0 ? item.caption.trim() : null,
      width: item.width ?? null,
      height: item.height ?? null,
      bytes: item.bytes ?? null,
      created_at: new Date().toISOString(),
    });
  }

  const dropzoneLabel =
    accept === "image"
      ? "Bilder oder GIFs hierher ziehen"
      : accept === "video"
        ? "Videos (MP4/WebM) hierher ziehen"
        : "Bilder, GIFs oder Videos hierher ziehen";

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          if (event.dataTransfer.files.length > 0) {
            handleFiles(event.dataTransfer.files);
          }
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`focus-visible:ring-accent flex flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed px-6 py-16 text-center transition-colors duration-[120ms] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          dragActive
            ? "border-accent bg-accent-soft"
            : "border-line bg-surface hover:border-line-strong cursor-pointer"
        }`}
      >
        <span className="bg-accent-soft flex size-12 items-center justify-center rounded-full">
          <Upload className="text-accent size-6" aria-hidden="true" />
        </span>
        <p className="text-ink text-[16px] font-semibold">{dropzoneLabel}</p>
        <p className="text-ink-muted text-[14px]">
          oder klicken, um Dateien auszuwählen — bis {formatMaxSize()}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          multiple={!crop}
          className="hidden"
          onChange={(event) => {
            if (event.target.files) handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {pending.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pending.map((item) => (
            <div
              key={item.id}
              className="border-line bg-surface flex flex-col gap-3 rounded-xl border p-4"
            >
              {item.previewUrl ? (
                <div className="bg-surface-alt relative aspect-video overflow-hidden rounded-lg">
                  {item.kind === "video" ? (
                    <video
                      src={item.previewUrl}
                      muted
                      preload="metadata"
                      className="size-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  )}
                  {item.status === "compressing" ||
                  item.status === "uploading" ? (
                    <div className="bg-ink/40 absolute inset-0 flex items-center justify-center">
                      <Loader2
                        className="size-6 animate-spin text-white"
                        aria-hidden="true"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {item.status === "compressing" ? (
                <p className="text-ink-muted text-[13px]">Wird verkleinert…</p>
              ) : null}

              {item.status === "uploading" ? (
                <div className="flex flex-col gap-1.5">
                  <Progress value={item.progress} />
                  <p className="text-ink-muted text-[13px]">
                    Wird hochgeladen… {item.progress}%
                  </p>
                </div>
              ) : null}

              {item.status === "awaiting-alt" || item.status === "saving" ? (
                <div className="flex flex-col gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-ink-muted text-[12px] font-medium">
                      Alt-Text (Pflicht)
                    </span>
                    <Input
                      autoFocus
                      value={item.alt}
                      onChange={(event) =>
                        patchPending(item.id, {
                          alt: event.target.value,
                          error: undefined,
                        })
                      }
                      placeholder={
                        item.kind === "video"
                          ? "Was ist im Video zu sehen?"
                          : "Was ist auf dem Bild zu sehen?"
                      }
                      invalid={Boolean(item.error)}
                      disabled={item.status === "saving"}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-ink-muted text-[12px] font-medium">
                      Bildunterschrift (optional)
                    </span>
                    <Textarea
                      value={item.caption}
                      onChange={(event) =>
                        patchPending(item.id, { caption: event.target.value })
                      }
                      className="min-h-[60px]"
                      disabled={item.status === "saving"}
                    />
                  </label>
                  {item.error ? (
                    <p role="alert" className="text-danger text-[13px]">
                      {item.error}
                    </p>
                  ) : null}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDiscard(item)}
                      disabled={item.status === "saving"}
                    >
                      Verwerfen
                    </Button>
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => handleSave(item)}
                      loading={item.status === "saving"}
                    >
                      Speichern
                    </Button>
                  </div>
                </div>
              ) : null}

              {item.status === "error" ? (
                <div className="flex flex-col gap-2">
                  <p className="text-danger flex items-center gap-1.5 text-[13px]">
                    <AlertTriangle
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    {item.error}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDiscard(item)}
                  >
                    <X className="size-4" aria-hidden="true" />
                    Entfernen
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {cropTarget ? (
        <ImageCropModal
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              URL.revokeObjectURL(cropTarget.objectUrl);
              setCropTarget(null);
            }
          }}
          imageUrl={cropTarget.objectUrl}
          fileName={cropTarget.file.name}
          mimeType={cropTarget.file.type}
          onCropped={(croppedFile) => {
            URL.revokeObjectURL(cropTarget.objectUrl);
            setCropTarget(null);
            enqueueFile(croppedFile);
          }}
        />
      ) : null}
    </div>
  );
}
