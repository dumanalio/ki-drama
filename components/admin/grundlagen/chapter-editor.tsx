"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { MediaPickerModal } from "@/components/admin/medien/media-picker-modal";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RichTextEditor } from "@/components/admin/tiptap/rich-text-editor";
import { useContentEditor } from "@/components/admin/tiptap/use-content-editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { deleteChapter, saveChapter } from "@/lib/actions/chapters";
import { slugify } from "@/lib/slugify";
import { estimateReadingMinutes } from "@/lib/tiptap-render";
import type { Chapter, Json } from "@/types/database";

export function ChapterEditor({ chapter }: { chapter: Chapter }) {
  const router = useRouter();

  const [title, setTitle] = React.useState(chapter.title);
  const [slug, setSlug] = React.useState(chapter.slug);
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(
    chapter.title.length > 0 && slugify(chapter.title) !== chapter.slug
  );
  const [summary, setSummary] = React.useState(chapter.summary);
  const [coverUrl, setCoverUrl] = React.useState<string | null>(
    chapter.cover_url
  );
  const [coverAlt, setCoverAlt] = React.useState(chapter.cover_alt ?? "");
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [level, setLevel] = React.useState(chapter.level as Chapter["level"]);
  const [status, setStatus] = React.useState(chapter.status);
  const [readingMin, setReadingMin] = React.useState(
    estimateReadingMinutes(chapter.body)
  );
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, startSaving] = React.useTransition();
  const [isDeleting, startDeleting] = React.useTransition();

  const bodyRef = React.useRef<Json>(chapter.body);

  const editor = useContentEditor({
    content: chapter.body,
    placeholder: "Schreib den Kapitelinhalt…",
    onUpdate: (json) => {
      bodyRef.current = json;
      setReadingMin(estimateReadingMinutes(json));
    },
  });

  function handleSave() {
    setError(null);
    startSaving(async () => {
      const result = await saveChapter({
        id: chapter.id,
        slug,
        title,
        summary,
        coverUrl,
        coverAlt: coverAlt.trim().length > 0 ? coverAlt.trim() : null,
        level,
        status,
        body: JSON.stringify(bodyRef.current),
      });
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Kapitel gespeichert");
      router.push("/admin/grundlagen");
    });
  }

  function handleDelete() {
    startDeleting(async () => {
      const result = await deleteChapter(chapter.id);
      if (result.ok) {
        toast.success("Kapitel gelöscht");
        router.push("/admin/grundlagen");
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <AdminPageHeader
        title={title || "Ohne Titel"}
        action={
          <Button variant="primary" onClick={handleSave} loading={isSaving}>
            Speichern
          </Button>
        }
      />

      <Link
        href="/admin/grundlagen"
        className="text-ink-muted hover:text-ink mb-6 inline-flex items-center gap-1.5 text-[14px]"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Zurück zur Liste
      </Link>

      {error ? (
        <p role="alert" className="text-danger mb-4 text-[14px]">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <RichTextEditor editor={editor} />

        <div className="flex flex-col gap-6">
          <div className="border-line bg-surface shadow-card rounded-xl border p-5">
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-ink-muted text-[12px] font-medium">
                  Titel
                </span>
                <Input
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (!slugManuallyEdited)
                      setSlug(slugify(event.target.value));
                  }}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-ink-muted text-[12px] font-medium">
                  Slug
                </span>
                <Input
                  value={slug}
                  onChange={(event) => {
                    setSlugManuallyEdited(true);
                    setSlug(event.target.value);
                  }}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-ink-muted text-[12px] font-medium">
                  Zusammenfassung
                </span>
                <Textarea
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  className="min-h-[80px]"
                />
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="text-ink-muted text-[12px] font-medium">
                  Coverbild
                </span>
                {coverUrl ? (
                  <div className="bg-surface-alt relative aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={coverUrl}
                      alt={coverAlt}
                      fill
                      sizes="320px"
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
                    {coverUrl ? "Bild ändern" : "Bild wählen"}
                  </Button>
                  {coverUrl ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => {
                        setCoverUrl(null);
                        setCoverAlt("");
                      }}
                    >
                      <X className="size-4" aria-hidden="true" />
                      Entfernen
                    </Button>
                  ) : null}
                </div>
                {coverUrl ? (
                  <Input
                    value={coverAlt}
                    onChange={(event) => setCoverAlt(event.target.value)}
                    placeholder="Alt-Text für das Coverbild"
                  />
                ) : null}
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-ink-muted text-[12px] font-medium">
                  Level
                </span>
                <Select
                  value={level}
                  onValueChange={(value) =>
                    value && setLevel(value as Chapter["level"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="einsteiger">Einsteiger</SelectItem>
                    <SelectItem value="fortgeschritten">
                      Fortgeschritten
                    </SelectItem>
                  </SelectContent>
                </Select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-ink-muted text-[12px] font-medium">
                  Status
                </span>
                <Select
                  value={status}
                  onValueChange={(value) =>
                    value && setStatus(value as Chapter["status"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entwurf">Entwurf</SelectItem>
                    <SelectItem value="veroeffentlicht">
                      Veröffentlicht
                    </SelectItem>
                  </SelectContent>
                </Select>
              </label>

              <p className="text-ink-muted text-[13px]">
                Lesezeit: ca. {readingMin} Min. (automatisch geschätzt)
              </p>
            </div>
          </div>

          <Modal>
            <ModalTrigger className={buttonVariants({ variant: "outline" })}>
              <Trash2 className="size-4" aria-hidden="true" />
              Kapitel löschen
            </ModalTrigger>
            <ModalContent
              title="Kapitel löschen?"
              footer={
                <>
                  <ModalClose
                    className={buttonVariants({ variant: "outline" })}
                  >
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
              Dieses Kapitel wird endgültig gelöscht. Das lässt sich nicht
              rückgängig machen.
            </ModalContent>
          </Modal>
        </div>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(media) => {
          setCoverUrl(media.url);
          setCoverAlt(media.alt);
          setPickerOpen(false);
        }}
      />
    </>
  );
}
