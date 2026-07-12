"use client";

import * as React from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ImagePlus,
  Trash2,
} from "lucide-react";

import { MediaPickerModal } from "@/components/admin/medien/media-picker-modal";
import { cn } from "@/lib/utils";
import type {
  ImageAlign,
  ImageSizePreset,
} from "@/components/admin/tiptap/image-extension";

const WIDTH_OPTIONS: { value: ImageSizePreset; label: string }[] = [
  { value: "small", label: "Klein" },
  { value: "medium", label: "Mittel" },
  { value: "full", label: "Volle Breite" },
];

const ALIGN_OPTIONS: {
  value: ImageAlign;
  icon: typeof AlignLeft;
  label: string;
}[] = [
  { value: "left", icon: AlignLeft, label: "Links ausrichten" },
  { value: "center", icon: AlignCenter, label: "Zentriert ausrichten" },
  { value: "right", icon: AlignRight, label: "Rechts ausrichten" },
];

function widthClass(preset: ImageSizePreset): string {
  if (preset === "small") return "max-w-[280px]";
  if (preset === "medium") return "max-w-[480px]";
  return "max-w-full";
}

function alignClass(align: ImageAlign): string {
  if (align === "left") return "mr-auto";
  if (align === "right") return "ml-auto";
  return "mx-auto";
}

export function ImageNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const src = node.attrs.src as string | null;
  const alt = (node.attrs.alt as string | null) ?? "";
  const caption = node.attrs.caption as string | null;
  const sizePreset =
    (node.attrs.sizePreset as ImageSizePreset | null) ?? "full";
  const align = (node.attrs.align as ImageAlign | null) ?? "center";

  return (
    <NodeViewWrapper className="my-4" data-drag-handle>
      <figure className={cn(widthClass(sizePreset), alignClass(align))}>
        <div
          className={cn(
            "bg-surface-alt overflow-hidden rounded-[20px] outline-none",
            selected && "ring-accent ring-2 ring-offset-2"
          )}
        >
          {src ? (
            // Remote Supabase-URL mit variabler, unbekannter Zielgröße im
            // Editor — next/image bringt hier keinen Vorteil gegenüber der
            // öffentlichen Seite, die bereits next/image nutzt.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt} className="h-auto w-full" />
          ) : null}
        </div>

        {selected ? (
          <input
            value={caption ?? ""}
            onChange={(event) =>
              updateAttributes({ caption: event.target.value })
            }
            placeholder="Bildunterschrift (optional)"
            className="text-ink-muted placeholder:text-ink-muted mt-2 w-full bg-transparent text-center text-[13px] outline-none"
          />
        ) : caption ? (
          <figcaption className="text-ink-muted mt-2 text-center text-[13px]">
            {caption}
          </figcaption>
        ) : null}

        {selected ? (
          <div
            contentEditable={false}
            className="border-line bg-surface shadow-float mt-2 flex flex-wrap items-center gap-1 rounded-lg border p-1.5"
          >
            {WIDTH_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateAttributes({ sizePreset: option.value })}
                className={cn(
                  "rounded px-2 py-1 text-[12px] font-medium",
                  sizePreset === option.value
                    ? "bg-accent-soft text-accent"
                    : "text-ink-soft hover:bg-surface-alt"
                )}
              >
                {option.label}
              </button>
            ))}

            <span className="bg-line mx-1 h-5 w-px" aria-hidden="true" />

            {ALIGN_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-label={option.label}
                onClick={() => updateAttributes({ align: option.value })}
                className={cn(
                  "flex size-7 items-center justify-center rounded",
                  align === option.value
                    ? "bg-accent-soft text-accent"
                    : "text-ink-soft hover:bg-surface-alt"
                )}
              >
                <option.icon className="size-4" aria-hidden="true" />
              </button>
            ))}

            <span className="bg-line mx-1 h-5 w-px" aria-hidden="true" />

            <button
              type="button"
              aria-label="Bild ersetzen"
              onClick={() => setPickerOpen(true)}
              className="text-ink-soft hover:bg-surface-alt flex size-7 items-center justify-center rounded"
            >
              <ImagePlus className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Bild entfernen"
              onClick={() => deleteNode()}
              className="text-danger hover:bg-danger-soft flex size-7 items-center justify-center rounded"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </figure>

      <MediaPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(media) => {
          updateAttributes({
            src: media.url,
            alt: media.alt,
            width: media.width,
            height: media.height,
          });
          setPickerOpen(false);
        }}
      />
    </NodeViewWrapper>
  );
}
