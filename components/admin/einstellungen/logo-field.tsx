"use client";

import Image from "next/image";

import { ImagePickerField } from "@/components/admin/einstellungen/image-picker-field";
import { Input } from "@/components/ui/input";

export function LogoField({
  label,
  imageUrl,
  imageAlt,
  height,
  onSelect,
  onAltChange,
  onRemove,
  onHeightChange,
}: {
  label: string;
  imageUrl: string | null;
  imageAlt: string | null;
  height: number;
  onSelect: (url: string, alt: string) => void;
  onAltChange: (alt: string) => void;
  onRemove: () => void;
  onHeightChange: (height: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <ImagePickerField
        label={label}
        imageUrl={imageUrl}
        imageAlt={imageAlt}
        onSelect={onSelect}
        onAltChange={onAltChange}
        onRemove={onRemove}
        crop
      />
      {imageUrl ? (
        <div className="flex items-end gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Höhe (px)
            </span>
            <Input
              type="number"
              min={16}
              max={120}
              value={height}
              onChange={(event) => onHeightChange(Number(event.target.value))}
              className="w-24"
            />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Vorschau in Originalgröße
            </span>
            <div className="border-line bg-canvas flex h-20 w-fit items-center rounded-lg border px-4">
              <Image
                src={imageUrl}
                alt={imageAlt ?? ""}
                width={height * 4}
                height={height}
                style={{ height, width: "auto" }}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
