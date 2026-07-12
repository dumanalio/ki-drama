"use client";

import * as React from "react";
import { AlertTriangle, Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { createMediaRecord, discardUploadedFile } from "@/lib/actions/media";
import { compressImageFile, uploadFileWithProgress } from "@/lib/media-client";
import type { Media } from "@/types/database";

interface PendingUpload {
  id: string;
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

export function MediaUploader({
  onSaved,
}: {
  onSaved: (media: Media) => void;
}) {
  const [pending, setPending] = React.useState<PendingUpload[]>([]);
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function patchPending(id: string, patch: Partial<PendingUpload>) {
    setPending((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function removePending(id: string) {
    setPending((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    for (const file of imageFiles) {
      const id = createLocalId();
      const previewUrl = URL.createObjectURL(file);
      setPending((prev) => [
        ...prev,
        {
          id,
          previewUrl,
          progress: 0,
          status: "compressing",
          alt: "",
          caption: "",
        },
      ]);

      void processUpload(id, file, previewUrl);
    }
  }

  async function processUpload(
    id: string,
    file: File,
    originalPreviewUrl: string
  ) {
    try {
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
            : "Das Bild konnte nicht verarbeitet werden.",
      });
    }
  }

  async function handleDiscard(item: PendingUpload) {
    URL.revokeObjectURL(item.previewUrl);
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
      return;
    }

    URL.revokeObjectURL(item.previewUrl);
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
            void handleFiles(event.dataTransfer.files);
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
        <p className="text-ink text-[16px] font-semibold">
          Bilder hierher ziehen
        </p>
        <p className="text-ink-muted text-[14px]">
          oder klicken, um Dateien auszuwählen
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) void handleFiles(event.target.files);
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
              <div className="bg-surface-alt relative aspect-video overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="size-full object-cover"
                />
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
                      placeholder="Was ist auf dem Bild zu sehen?"
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
    </div>
  );
}
