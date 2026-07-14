"use client";

import * as React from "react";
import { ImageOff, Search } from "lucide-react";

import { MediaDetailModal } from "@/components/admin/medien/media-detail-modal";
import { MediaThumbnail } from "@/components/admin/medien/media-thumbnail";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import type { Media } from "@/types/database";

export function MediaGrid({
  media,
  onUpdated,
  onDeleted,
}: {
  media: Media[];
  onUpdated: (media: Media) => void;
  onDeleted: (id: string) => void;
}) {
  const [search, setSearch] = React.useState("");
  const [openItem, setOpenItem] = React.useState<Media | null>(null);

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return media;
    return media.filter(
      (item) =>
        item.alt.toLowerCase().includes(query) ||
        item.path.toLowerCase().includes(query)
    );
  }, [media, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-md">
        <Search
          className="text-ink-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nach Alt-Text oder Dateiname suchen…"
          className="pl-9"
          aria-label="Medienbibliothek durchsuchen"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={search ? Search : ImageOff}
          title={search ? "Keine Treffer" : "Noch keine Bilder"}
          description={
            search
              ? "Passe die Suche an, um Ergebnisse zu sehen."
              : "Lade oben dein erstes Bild hoch."
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenItem(item)}
              className="group focus-visible:ring-accent bg-surface-alt relative aspect-square overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <MediaThumbnail
                media={item}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-[180ms] group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {openItem ? (
        <MediaDetailModal
          media={openItem}
          onClose={() => setOpenItem(null)}
          onUpdated={(updated) => {
            onUpdated(updated);
            setOpenItem(updated);
          }}
          onDeleted={(id) => {
            onDeleted(id);
            setOpenItem(null);
          }}
        />
      ) : null}
    </div>
  );
}
