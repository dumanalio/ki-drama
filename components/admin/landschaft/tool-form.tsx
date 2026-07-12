"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";

import { MediaPickerModal } from "@/components/admin/medien/media-picker-modal";
import { AdminPageHeader } from "@/components/admin/page-header";
import { TagInput } from "@/components/admin/tag-input";
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
import { deleteTool, saveTool } from "@/lib/actions/tools";
import { slugify } from "@/lib/slugify";
import type { Tool } from "@/types/database";

export function ToolForm({ tool }: { tool: Tool }) {
  const router = useRouter();

  const [name, setName] = React.useState(tool.name);
  const [slug, setSlug] = React.useState(tool.slug);
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(
    tool.name.length > 0 && slugify(tool.name) !== tool.slug
  );
  const [vendor, setVendor] = React.useState(tool.vendor ?? "");
  const [category, setCategory] = React.useState(tool.category);
  const [summary, setSummary] = React.useState(tool.summary);
  const [goodFor, setGoodFor] = React.useState<string[]>(tool.good_for);
  const [watchOut, setWatchOut] = React.useState(tool.watch_out ?? "");
  const [logoUrl, setLogoUrl] = React.useState(tool.logo_url ?? "");
  const [website, setWebsite] = React.useState(tool.website ?? "");
  const [priceHint, setPriceHint] = React.useState(tool.price_hint ?? "");
  const [status, setStatus] = React.useState(tool.status);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, startSaving] = React.useTransition();
  const [isDeleting, startDeleting] = React.useTransition();

  function handleSave() {
    setError(null);
    startSaving(async () => {
      const result = await saveTool({
        id: tool.id,
        slug,
        name,
        vendor,
        category,
        summary,
        goodFor,
        watchOut,
        logoUrl,
        website,
        priceHint,
        status,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/landschaft");
    });
  }

  function handleDelete() {
    startDeleting(async () => {
      const result = await deleteTool(tool.id);
      if (result.ok) {
        router.push("/admin/landschaft");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <AdminPageHeader
        title={name || "Ohne Namen"}
        action={
          <Button variant="primary" onClick={handleSave} loading={isSaving}>
            Speichern
          </Button>
        }
      />

      <Link
        href="/admin/landschaft"
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

      <div className="border-line bg-surface shadow-card max-w-2xl rounded-xl border p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">Name</span>
            <Input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (!slugManuallyEdited) setSlug(slugify(event.target.value));
              }}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">Slug</span>
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
              Anbieter
            </span>
            <Input
              value={vendor}
              onChange={(event) => setVendor(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Kategorie
            </span>
            <Input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Text, Bild, Audio, Code, Agenten…"
            />
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-1">
          <span className="text-ink-muted text-[12px] font-medium">
            Zusammenfassung
          </span>
          <Textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            className="min-h-[80px]"
          />
        </label>

        <label className="mt-4 flex flex-col gap-1">
          <span className="text-ink-muted text-[12px] font-medium">
            Gut geeignet für
          </span>
          <TagInput
            value={goodFor}
            onChange={setGoodFor}
            placeholder="Stichwort + Enter"
          />
        </label>

        <label className="mt-4 flex flex-col gap-1">
          <span className="text-ink-muted text-[12px] font-medium">
            Worauf achten (Datenschutz, Kosten …)
          </span>
          <Textarea
            value={watchOut}
            onChange={(event) => setWatchOut(event.target.value)}
            className="min-h-[70px]"
          />
        </label>

        <div className="mt-4 flex flex-col gap-1.5">
          <span className="text-ink-muted text-[12px] font-medium">Logo</span>
          {logoUrl ? (
            <div className="bg-surface-alt relative size-16 overflow-hidden rounded-lg">
              <Image
                src={logoUrl}
                alt=""
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => setPickerOpen(true)}
          >
            <ImagePlus className="size-4" aria-hidden="true" />
            {logoUrl ? "Logo ändern" : "Logo wählen"}
          </Button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Website
            </span>
            <Input
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://…"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Preis-Hinweis
            </span>
            <Input
              value={priceHint}
              onChange={(event) => setPriceHint(event.target.value)}
              placeholder="kostenlos / ab 20 $ pro Monat"
            />
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-1">
          <span className="text-ink-muted text-[12px] font-medium">Status</span>
          <Select
            value={status}
            onValueChange={(value) =>
              value && setStatus(value as Tool["status"])
            }
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entwurf">Entwurf</SelectItem>
              <SelectItem value="veroeffentlicht">Veröffentlicht</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>

      <Modal>
        <ModalTrigger
          className={`${buttonVariants({ variant: "outline" })} mt-6`}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Tool löschen
        </ModalTrigger>
        <ModalContent
          title="Tool löschen?"
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
          Dieses Tool wird endgültig gelöscht. Das lässt sich nicht rückgängig
          machen.
        </ModalContent>
      </Modal>

      <MediaPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(media) => {
          setLogoUrl(media.url);
          setPickerOpen(false);
        }}
      />
    </>
  );
}
