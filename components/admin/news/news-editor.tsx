"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { MediaPickerModal } from "@/components/admin/medien/media-picker-modal";
import { AdminPageHeader } from "@/components/admin/page-header";
import { TagInput } from "@/components/admin/tag-input";
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
import { deletePost, savePost } from "@/lib/actions/posts";
import { estimateReadingMinutes } from "@/lib/tiptap-render";
import { isVideoPath } from "@/lib/media-constants";
import { slugify } from "@/lib/slugify";
import type { Json, Post } from "@/types/database";

const AUTOSAVE_INTERVAL_MS = 10000;

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function NewsEditor({ post }: { post: Post }) {
  const router = useRouter();

  const [title, setTitle] = React.useState(post.title);
  const [slug, setSlug] = React.useState(post.slug);
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(
    post.title.length > 0 && slugify(post.title) !== post.slug
  );
  const [excerpt, setExcerpt] = React.useState(post.excerpt);
  const [category, setCategory] = React.useState(post.category);
  const [tags, setTags] = React.useState<string[]>(post.tags);
  const [coverUrl, setCoverUrl] = React.useState<string | null>(post.cover_url);
  const [coverAlt, setCoverAlt] = React.useState(post.cover_alt ?? "");
  const [status, setStatus] = React.useState(post.status);
  const [readingMin, setReadingMin] = React.useState(post.reading_min);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [isDeleting, startDeleting] = React.useTransition();

  const bodyRef = React.useRef<Json>(post.body);
  const stateRef = React.useRef({
    title,
    slug,
    excerpt,
    category,
    tags,
    coverUrl,
    coverAlt,
    status,
  });
  stateRef.current = {
    title,
    slug,
    excerpt,
    category,
    tags,
    coverUrl,
    coverAlt,
    status,
  };

  const editor = useContentEditor({
    content: post.body,
    placeholder: "Schreib deinen Beitrag…",
    onUpdate: (json) => {
      bodyRef.current = json;
      setReadingMin(estimateReadingMinutes(json));
      setDirty(true);
    },
  });

  function markDirty<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setDirty(true);
    };
  }

  async function save(
    nextStatus?: Post["status"],
    options?: { announce?: boolean }
  ) {
    const announce = options?.announce ?? false;
    const current = stateRef.current;
    const finalStatus = nextStatus ?? current.status;

    setSaveStatus("saving");
    setError(null);

    const result = await savePost({
      id: post.id,
      title: current.title,
      slug: current.slug,
      excerpt: current.excerpt,
      category: current.category,
      tags: current.tags,
      coverUrl: current.coverUrl,
      coverAlt: current.coverAlt || null,
      status: finalStatus,
      body: JSON.stringify(bodyRef.current),
    });

    if (!result.ok) {
      setSaveStatus("error");
      setError(result.error);
      // Auch beim automatischen Speichern immer melden — ein fehlgeschlagenes
      // Autosave darf nicht unbemerkt bleiben, sonst geht Arbeit verloren.
      toast.error(result.error);
      return;
    }

    if (nextStatus) setStatus(nextStatus);
    setDirty(false);
    setSaveStatus("saved");
    if (announce) {
      toast.success(
        finalStatus === "veroeffentlicht"
          ? "Beitrag veröffentlicht"
          : "Änderungen gespeichert"
      );
    }
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (dirty) void save();
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty]);

  async function handlePrimaryAction() {
    if (status === "entwurf") {
      await save("veroeffentlicht", { announce: true });
    } else {
      await save(undefined, { announce: true });
    }
  }

  async function handlePreview() {
    await save();
    window.open(`/news/${stateRef.current.slug}?preview=1`, "_blank");
  }

  function handleDelete() {
    startDeleting(async () => {
      const result = await deletePost(post.id);
      if (result.ok) {
        toast.success("Beitrag gelöscht");
        router.push("/admin/news");
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
          <div className="flex items-center gap-3">
            <span className="text-ink-muted text-[13px]" aria-live="polite">
              {saveStatus === "saving"
                ? "Wird gespeichert…"
                : saveStatus === "saved"
                  ? "Gespeichert"
                  : saveStatus === "error"
                    ? "Fehler beim Speichern"
                    : ""}
            </span>
            <Button variant="outline" onClick={handlePreview}>
              Vorschau
            </Button>
            <Button
              variant="primary"
              onClick={handlePrimaryAction}
              loading={saveStatus === "saving"}
            >
              {status === "entwurf"
                ? "Veröffentlichen"
                : "Änderungen speichern"}
            </Button>
          </div>
        }
      />

      <Link
        href="/admin/news"
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

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
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
                    const value = event.target.value;
                    markDirty(setTitle)(value);
                    if (!slugManuallyEdited) setSlug(slugify(value));
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
                    markDirty(setSlug)(event.target.value);
                  }}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-ink-muted text-[12px] font-medium">
                  Auszug
                </span>
                <Textarea
                  value={excerpt}
                  onChange={(event) =>
                    markDirty(setExcerpt)(event.target.value)
                  }
                  className="min-h-[80px]"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-ink-muted text-[12px] font-medium">
                  Kategorie
                </span>
                <Input
                  value={category}
                  onChange={(event) =>
                    markDirty(setCategory)(event.target.value)
                  }
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-ink-muted text-[12px] font-medium">
                  Tags
                </span>
                <TagInput
                  value={tags}
                  onChange={markDirty(setTags)}
                  placeholder="Tag + Enter"
                />
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="text-ink-muted text-[12px] font-medium">
                  Cover (Bild oder Video)
                </span>
                {coverUrl ? (
                  <div className="bg-surface-alt relative aspect-video overflow-hidden rounded-lg">
                    {isVideoPath(coverUrl) ? (
                      <video
                        src={coverUrl}
                        muted
                        preload="metadata"
                        className="size-full object-cover"
                      />
                    ) : (
                      <Image
                        src={coverUrl}
                        alt={coverAlt}
                        fill
                        sizes="340px"
                        className="object-cover"
                      />
                    )}
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPickerOpen(true)}
                  >
                    <ImagePlus className="size-4" aria-hidden="true" />
                    {coverUrl ? "Bild/Video ändern" : "Bild oder Video wählen"}
                  </Button>
                  {coverUrl ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        markDirty(setCoverUrl)(null);
                        markDirty(setCoverAlt)("");
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
                    onChange={(event) =>
                      markDirty(setCoverAlt)(event.target.value)
                    }
                    placeholder="Alt-Text für das Cover"
                  />
                ) : null}
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-ink-muted text-[12px] font-medium">
                  Status
                </span>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    if (value) markDirty(setStatus)(value as Post["status"]);
                  }}
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
              Beitrag löschen
            </ModalTrigger>
            <ModalContent
              title="Beitrag löschen?"
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
              Dieser Beitrag wird endgültig gelöscht. Das lässt sich nicht
              rückgängig machen.
            </ModalContent>
          </Modal>
        </div>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        accept="all"
        onSelect={(media) => {
          markDirty(setCoverUrl)(media.url);
          markDirty(setCoverAlt)(media.alt);
          setPickerOpen(false);
        }}
      />
    </>
  );
}
