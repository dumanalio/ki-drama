"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

import { MediaPickerModal } from "@/components/admin/medien/media-picker-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isVideoPath, type VideoPlaybackMode } from "@/lib/media-constants";

const PLAYBACK_OPTIONS: { value: VideoPlaybackMode; label: string }[] = [
  { value: "controls", label: "Mit Steuerung" },
  { value: "auto", label: "Läuft automatisch" },
];

export function ImagePickerField({
  label,
  imageUrl,
  imageAlt,
  onSelect,
  onAltChange,
  onRemove,
  crop = false,
  allowVideo = false,
  videoPlaybackMode,
  onVideoPlaybackModeChange,
}: {
  label: string;
  imageUrl: string | null;
  imageAlt: string | null;
  onSelect: (url: string, alt: string) => void;
  onAltChange: (alt: string) => void;
  onRemove: () => void;
  /** Zeigt beim Hochladen einen Zuschneide-Schritt (z. B. für Logos). */
  crop?: boolean;
  /** Erlaubt zusätzlich MP4/WebM statt nur Bildern (z. B. Hero, Abschnitte). */
  allowVideo?: boolean;
  videoPlaybackMode?: VideoPlaybackMode;
  onVideoPlaybackModeChange?: (mode: VideoPlaybackMode) => void;
}) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const isVideo = allowVideo && Boolean(imageUrl) && isVideoPath(imageUrl ?? "");

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-ink-muted text-[12px] font-medium">{label}</span>
      {imageUrl ? (
        <div className="bg-surface-alt relative aspect-4/3 w-full max-w-[220px] overflow-hidden rounded-lg">
          {isVideo ? (
            <video
              src={imageUrl}
              muted
              preload="metadata"
              className="size-full object-cover"
            />
          ) : (
            <Image
              src={imageUrl}
              alt={imageAlt ?? ""}
              fill
              sizes="220px"
              className="object-cover"
            />
          )}
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
          {imageUrl
            ? allowVideo
              ? "Bild/Video ändern"
              : "Bild ändern"
            : allowVideo
              ? "Bild oder Video wählen"
              : "Bild wählen"}
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
          placeholder={isVideo ? "Alt-Text für das Video" : "Alt-Text für das Bild"}
          className="max-w-[320px]"
        />
      ) : null}

      {isVideo && onVideoPlaybackModeChange ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-ink-muted text-[12px] font-medium">
            Wiedergabe
          </span>
          <div className="flex flex-wrap gap-2">
            {PLAYBACK_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={videoPlaybackMode === option.value}
                onClick={() => onVideoPlaybackModeChange(option.value)}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors duration-[120ms]",
                  videoPlaybackMode === option.value
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line text-ink-soft hover:border-line-strong"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <MediaPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        crop={crop}
        accept={allowVideo ? "all" : "image"}
        onSelect={(media) => {
          onSelect(media.url, media.alt);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
