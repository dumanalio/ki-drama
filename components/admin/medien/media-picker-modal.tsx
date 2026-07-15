"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { MediaThumbnail } from "@/components/admin/medien/media-thumbnail";
import { MediaUploader, type MediaAccept } from "@/components/admin/medien/media-uploader";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@/components/ui/tabs";
import { listMediaForPicker } from "@/lib/actions/media";
import { isVideoPath } from "@/lib/media-constants";
import type { Media } from "@/types/database";

export function MediaPickerModal({
  open,
  onOpenChange,
  onSelect,
  accept = "image",
  crop = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: Media) => void;
  accept?: MediaAccept;
  /** Zeigt beim Hochladen einen Zuschneide-Schritt (z. B. für Logos). */
  crop?: boolean;
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
    const byKind = media.filter((item) =>
      accept === "all" ? true : accept === "video" ? isVideoPath(item.path) : !isVideoPath(item.path)
    );
    const query = search.trim().toLowerCase();
    if (!query) return byKind;
    return byKind.filter(
      (item) =>
        item.alt.toLowerCase().includes(query) ||
        item.path.toLowerCase().includes(query)
    );
  }, [media, search, accept]);

  const title = accept === "video" ? "Video auswählen" : "Bild auswählen";
  const emptyLabel = accept === "video" ? "Videos" : "Bilder";

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title={title} className="max-w-3xl">
        <Tabs defaultValue="library">
          <TabsList>
            <TabsTab value="library">Aus Bibliothek wählen</TabsTab>
            <TabsTab value="upload">Neu hochladen</TabsTab>
            <TabsIndicator />
          </TabsList>

          <TabsPanel value="library">
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
                  title={`Keine ${emptyLabel} gefunden`}
                  description="Lade eine Datei über den Tab „Neu hochladen“ hoch."
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
                      <MediaThumbnail
                        media={item}
                        sizes="200px"
                        className="object-cover transition-transform duration-[180ms] group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </TabsPanel>

          <TabsPanel value="upload">
            <div className="max-h-[60vh] overflow-y-auto">
              <MediaUploader
                accept={accept}
                crop={crop}
                onSaved={(saved) => onSelect(saved)}
              />
            </div>
          </TabsPanel>
        </Tabs>
      </ModalContent>
    </Modal>
  );
}
