"use client";

import * as React from "react";
import Image from "next/image";
import { Search } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { listMediaForPicker } from "@/lib/actions/media";
import type { Media } from "@/types/database";

export function MediaPickerModal({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: Media) => void;
}) {
  const [media, setMedia] = React.useState<Media[] | null>(null);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setMedia(null);
    listMediaForPicker()
      .then(setMedia)
      .catch(() => setMedia([]));
  }, [open]);

  const filtered = React.useMemo(() => {
    if (!media) return [];
    const query = search.trim().toLowerCase();
    if (!query) return media;
    return media.filter(
      (item) =>
        item.alt.toLowerCase().includes(query) ||
        item.path.toLowerCase().includes(query)
    );
  }, [media, search]);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title="Bild aus der Medienbibliothek" className="max-w-3xl">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search
              className="text-ink-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nach Alt-Text oder Dateiname suchen…"
              className="pl-9"
            />
          </div>

          {media === null ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Keine Bilder gefunden"
              description="Lade zuerst ein Bild in der Medienbibliothek hoch."
            />
          ) : (
            <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className="group focus-visible:ring-accent bg-surface-alt relative aspect-square overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  <Image
                    src={item.url}
                    alt={item.alt}
                    fill
                    sizes="200px"
                    className="object-cover transition-transform duration-[180ms] group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
