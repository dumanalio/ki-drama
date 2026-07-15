"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { deletePage, savePage } from "@/lib/actions/pages";
import { slugify } from "@/lib/slugify";
import type { Json, Page } from "@/types/database";

const AUTOSAVE_INTERVAL_MS = 10000;

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function PageEditor({ page }: { page: Page }) {
  const router = useRouter();

  const [title, setTitle] = React.useState(page.title);
  const [slug, setSlug] = React.useState(page.slug);
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(
    page.title.length > 0 && slugify(page.title) !== page.slug
  );
  const [status, setStatus] = React.useState(page.status);
  const [dirty, setDirty] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [isDeleting, startDeleting] = React.useTransition();

  const bodyRef = React.useRef<Json>(page.body);
  const stateRef = React.useRef({ title, slug, status });
  stateRef.current = { title, slug, status };

  const editor = useContentEditor({
    content: page.body,
    placeholder: "Inhalt der Seite…",
    onUpdate: (json) => {
      bodyRef.current = json;
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
    nextStatus?: Page["status"],
    options?: { announce?: boolean }
  ) {
    const announce = options?.announce ?? false;
    const current = stateRef.current;
    const finalStatus = nextStatus ?? current.status;

    setSaveStatus("saving");
    setError(null);

    const result = await savePage({
      id: page.id,
      title: current.title,
      slug: current.slug,
      status: finalStatus,
      body: JSON.stringify(bodyRef.current),
    });

    if (!result.ok) {
      setSaveStatus("error");
      setError(result.error);
      toast.error(result.error);
      return;
    }

    if (nextStatus) setStatus(nextStatus);
    setDirty(false);
    setSaveStatus("saved");
    if (announce) {
      toast.success(
        finalStatus === "veroeffentlicht"
          ? "Seite veröffentlicht"
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
    window.open(`/${stateRef.current.slug}?preview=1`, "_blank");
  }

  function handleDelete() {
    startDeleting(async () => {
      const result = await deletePage(page.id);
      if (result.ok) {
        toast.success("Seite gelöscht");
        router.push("/admin/seiten");
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
        href="/admin/seiten"
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
                <span className="text-ink-muted text-[12px]">
                  Erreichbar unter /{slug || "…"}
                </span>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-ink-muted text-[12px] font-medium">
                  Status
                </span>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    if (value) markDirty(setStatus)(value as Page["status"]);
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
            </div>
          </div>

          <Modal>
            <ModalTrigger className={buttonVariants({ variant: "outline" })}>
              <Trash2 className="size-4" aria-hidden="true" />
              Seite löschen
            </ModalTrigger>
            <ModalContent
              title="Seite löschen?"
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
              Diese Seite wird endgültig gelöscht. Navigationspunkte, die
              darauf verweisen, führen danach ins Leere. Das lässt sich nicht
              rückgängig machen.
            </ModalContent>
          </Modal>
        </div>
      </div>
    </>
  );
}
