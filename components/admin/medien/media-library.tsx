"use client";

import * as React from "react";

import { MediaGrid } from "@/components/admin/medien/media-grid";
import { MediaUploader } from "@/components/admin/medien/media-uploader";
import type { Media } from "@/types/database";

export function MediaLibrary({ initialMedia }: { initialMedia: Media[] }) {
  const [media, setMedia] = React.useState(initialMedia);

  return (
    <div className="flex flex-col gap-8">
      <MediaUploader
        onSaved={(saved) => setMedia((prev) => [saved, ...prev])}
      />
      <MediaGrid
        media={media}
        onUpdated={(updated) =>
          setMedia((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
          )
        }
        onDeleted={(id) =>
          setMedia((prev) => prev.filter((item) => item.id !== id))
        }
      />
    </div>
  );
}
