"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

import { MediaPickerModal } from "@/components/admin/medien/media-picker-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ImagePickerField({
  label,
  imageUrl,
  imageAlt,
  onSelect,
  onAltChange,
  onRemove,
  crop = false,
}: {
  label: string;
  imageUrl: string | null;
  imageAlt: string | null;
  onSelect: (url: string, alt: string) => void;
  onAltChange: (alt: string) => void;
  onRemove: () => void;
  /** Zeigt beim Hochladen einen Zuschneide-Schritt (z. B. für Logos). */
  crop?: boolean;
}) {
  const [pickerOpen, setPickerOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-ink-muted text-[12px] font-medium">{label}</span>
      {imageUrl ? (
        <div className="bg-surface-alt relative aspect-4/3 w-full max-w-[220px] overflow-hidden rounded-lg">
          <Image
            src={imageUrl}
            alt={imageAlt ?? ""}
            fill
            sizes="220px"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => setPickerOpen(true)}
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          {imageUrl ? "Bild ändern" : "Bild wählen"}
        </Button>
        {imageUrl ? (
          <Button variant="outline" size="sm" className="w-fit" onClick={onRemove}>
            <X className="size-4" aria-hidden="true" />
            Entfernen
          </Button>
        ) : null}
      </div>
      {imageUrl ? (
        <Input
          value={imageAlt ?? ""}
          onChange={(event) => onAltChange(event.target.value)}
          placeholder="Alt-Text für das Bild"
          className="max-w-[320px]"
        />
      ) : null}

      <MediaPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        crop={crop}
        onSelect={(media) => {
          onSelect(media.url, media.alt);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
