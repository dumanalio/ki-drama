"use client";

import * as React from "react";
import Image from "next/image";
import { Check, Copy, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { deleteMediaRecord, updateMediaRecord } from "@/lib/actions/media";
import type { Media } from "@/types/database";

function formatBytes(bytes: number | null): string {
  if (!bytes) return "unbekannt";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaDetailModal({
  media,
  onClose,
  onUpdated,
  onDeleted,
}: {
  media: Media;
  onClose: () => void;
  onUpdated: (media: Media) => void;
  onDeleted: (id: string) => void;
}) {
  const [alt, setAlt] = React.useState(media.alt);
  const [caption, setCaption] = React.useState(media.caption ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [isSaving, startSaving] = React.useTransition();
  const [isDeleting, startDeleting] = React.useTransition();

  function handleSave() {
    setError(null);
    startSaving(async () => {
      const result = await updateMediaRecord({
        id: media.id,
        alt,
        caption: caption.trim().length > 0 ? caption.trim() : null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onUpdated({
        ...media,
        alt: alt.trim(),
        caption: caption.trim().length > 0 ? caption.trim() : null,
      });
    });
  }

  function handleDelete() {
    setError(null);
    startDeleting(async () => {
      const result = await deleteMediaRecord({ id: media.id });
      if (!result.ok) {
        setError(result.error);
        setConfirmingDelete(false);
        return;
      }
      onDeleted(media.id);
    });
  }

  async function handleCopyUrl() {
    await navigator.clipboard.writeText(media.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent title="Bild bearbeiten" className="max-w-2xl">
        <div className="flex flex-col gap-5">
          <div className="bg-surface-alt relative aspect-video overflow-hidden rounded-xl">
            <Image
              src={media.url}
              alt={media.alt}
              fill
              sizes="600px"
              className="object-contain"
            />
          </div>

          <dl className="text-ink-muted grid grid-cols-2 gap-x-4 gap-y-1 text-[13px] sm:grid-cols-4">
            <div>
              <dt className="font-medium">Maße</dt>
              <dd>
                {media.width && media.height
                  ? `${media.width} × ${media.height}px`
                  : "unbekannt"}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Dateigröße</dt>
              <dd>{formatBytes(media.bytes)}</dd>
            </div>
          </dl>

          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Alt-Text (Pflicht)
            </span>
            <Input
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              invalid={Boolean(error)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Bildunterschrift (optional)
            </span>
            <Textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              className="min-h-[70px]"
            />
          </label>

          <div className="flex items-center gap-2">
            <Input readOnly value={media.url} className="text-[13px]" />
            <Button variant="outline" size="sm" onClick={handleCopyUrl}>
              {copied ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
              {copied ? "Kopiert" : "URL kopieren"}
            </Button>
          </div>

          {error ? (
            <p role="alert" className="text-danger text-[13px]">
              {error}
            </p>
          ) : null}

          {confirmingDelete ? (
            <div className="border-danger/30 bg-danger-soft flex flex-col gap-3 rounded-lg border p-4">
              <p className="text-danger text-[14px]">
                Dieses Bild wirklich löschen? Das lässt sich nicht rückgängig
                machen. Falls es in Beiträgen verwendet wird, bleibt dort ein
                defekter Link zurück.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmingDelete(false)}
                >
                  Zurück
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDelete}
                  loading={isDeleting}
                >
                  Ja, löschen
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setConfirmingDelete(true)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Löschen
              </Button>
              <Button variant="accent" onClick={handleSave} loading={isSaving}>
                Speichern
              </Button>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
