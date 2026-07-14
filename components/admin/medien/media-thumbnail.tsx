import Image from "next/image";
import { PlayCircle } from "lucide-react";

import { isVideoPath } from "@/lib/media-constants";
import { cn } from "@/lib/utils";

/**
 * Vorschau-Kachel für ein Medien-Element -- Video wird stumm ohne Autoplay
 * als erstes Frame gezeigt (kein next/image, das kann keine Videos), Bild
 * (inkl. animierter GIFs) über next/image wie bisher.
 */
export function MediaThumbnail({
  media,
  sizes,
  className = "object-cover",
}: {
  media: { url: string; alt: string; path: string };
  sizes: string;
  className?: string;
}) {
  if (isVideoPath(media.path)) {
    return (
      <>
        <video
          src={media.url}
          muted
          preload="metadata"
          className={cn("size-full", className)}
        />
        <div
          className="bg-ink/25 pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <PlayCircle className="size-8 text-white" />
        </div>
      </>
    );
  }

  return (
    <Image src={media.url} alt={media.alt} fill sizes={sizes} className={className} />
  );
}
