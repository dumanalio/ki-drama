"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SortableList } from "@/components/admin/sortable-list";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/modal";
import { deleteChapter, reorderChapters } from "@/lib/actions/chapters";
import type { Chapter } from "@/types/database";

const LEVEL_LABELS: Record<Chapter["level"], string> = {
  einsteiger: "Einsteiger",
  fortgeschritten: "Fortgeschritten",
};

function ChapterRow({ chapter }: { chapter: Chapter }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDeleting, startDeleting] = React.useTransition();

  function handleDelete() {
    setError(null);
    startDeleting(async () => {
      const result = await deleteChapter(chapter.id);
      setConfirmOpen(false);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Kapitel gelöscht");
        router.refresh();
      }
    });
  }

  return (
    <div className="border-line bg-surface flex items-center justify-between gap-4 rounded-xl border p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="bg-surface-alt relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg">
          {chapter.cover_url ? (
            <Image
              src={chapter.cover_url}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <ImageOff className="text-ink-muted size-5" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <Link
            href={`/admin/grundlagen/${chapter.id}`}
            className="text-ink hover:text-accent focus-visible:ring-accent truncate rounded font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {chapter.title || "Ohne Titel"}
          </Link>
          <p className="text-ink-muted truncate text-[13px]">
            {LEVEL_LABELS[chapter.level as Chapter["level"]] ?? chapter.level}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge
          variant={chapter.status === "veroeffentlicht" ? "success" : "soft"}
        >
          {chapter.status === "veroeffentlicht" ? "Veröffentlicht" : "Entwurf"}
        </Badge>
        <Modal open={confirmOpen} onOpenChange={setConfirmOpen}>
          <ModalTrigger
            className={buttonVariants({ variant: "outline", size: "sm" })}
            aria-label="Kapitel löschen"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </ModalTrigger>
          <ModalContent
            title="Kapitel löschen?"
            footer={
              <>
                <ModalClose className={buttonVariants({ variant: "outline" })}>
                  Zurück
                </ModalClose>
                <Button
                  variant="primary"
                  onClick={handleDelete}
                  loading={isDeleting}
                >
                  Ja, löschen
                </Button>
              </>
            }
          >
            {chapter.title || "Dieses Kapitel"} wird endgültig gelöscht. Das
            lässt sich nicht rückgängig machen.
          </ModalContent>
        </Modal>
      </div>
      {error ? (
        <p role="alert" className="text-danger text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ChapterList({ chapters }: { chapters: Chapter[] }) {
  const [items, setItems] = React.useState(chapters);

  React.useEffect(() => {
    setItems(chapters);
  }, [chapters]);

  function handleReorder(next: Chapter[]) {
    setItems(next);
    reorderChapters(next.map((item) => item.id)).then((result) => {
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <SortableList
      items={items}
      onReorder={handleReorder}
      renderItem={(chapter) => <ChapterRow chapter={chapter} />}
    />
  );
}
