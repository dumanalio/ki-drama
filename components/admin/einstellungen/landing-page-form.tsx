"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";

import { MediaPickerModal } from "@/components/admin/medien/media-picker-modal";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveLandingPageContent } from "@/lib/actions/settings";
import type { LandingPageContent } from "@/lib/landing-content";

const PROBLEM_CARD_LABELS = [
  "Karte 1 — Überflutung",
  "Karte 2 — Unsicherheit",
  "Karte 3 — Uninformierte Teams",
];
const SPLIT_SECTION_LABELS = [
  "Sektion 1 — Grundlagen",
  "Sektion 2 — Landschaft",
];

function ImagePickerField({
  label,
  imageUrl,
  imageAlt,
  onSelect,
  onAltChange,
}: {
  label: string;
  imageUrl: string | null;
  imageAlt: string | null;
  onSelect: (url: string, alt: string) => void;
  onAltChange: (alt: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-ink-muted text-[12px] font-medium">{label}</span>
      {imageUrl ? (
        <div className="bg-surface-alt relative aspect-4/3 w-full max-w-[220px] overflow-hidden rounded-lg">
          <Image
            src={imageUrl}
            alt={imageAlt ?? ""}
            fill
            sizes="220px"
            className="object-cover"
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
        {imageUrl ? "Bild ändern" : "Bild wählen"}
      </Button>
      {imageUrl ? (
        <Input
          value={imageAlt ?? ""}
          onChange={(event) => onAltChange(event.target.value)}
          placeholder="Alt-Text für das Bild"
          className="max-w-[320px]"
        />
      ) : null}

      <MediaPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(media) => {
          onSelect(media.url, media.alt);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

export function LandingPageForm({
  content: initial,
}: {
  content: LandingPageContent;
}) {
  const [content, setContent] = React.useState(initial);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, startSaving] = React.useTransition();

  function updateHero(patch: Partial<LandingPageContent["hero"]>) {
    setContent((prev) => ({ ...prev, hero: { ...prev.hero, ...patch } }));
  }

  function updateProblemCard(
    index: number,
    patch: Partial<LandingPageContent["problemCards"][number]>
  ) {
    setContent((prev) => ({
      ...prev,
      problemCards: prev.problemCards.map((card, i) =>
        i === index ? { ...card, ...patch } : card
      ),
    }));
  }

  function updateSplitSection(
    index: number,
    patch: Partial<LandingPageContent["splitSections"][number]>
  ) {
    setContent((prev) => ({
      ...prev,
      splitSections: prev.splitSections.map((section, i) =>
        i === index ? { ...section, ...patch } : section
      ),
    }));
  }

  function updateChecklistItem(
    sectionIndex: number,
    itemIndex: number,
    value: string
  ) {
    setContent((prev) => ({
      ...prev,
      splitSections: prev.splitSections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              checklistItems: section.checklistItems.map((item, j) =>
                j === itemIndex ? value : item
              ),
            }
          : section
      ),
    }));
  }

  function updateClosingCta(patch: Partial<LandingPageContent["closingCta"]>) {
    setContent((prev) => ({
      ...prev,
      closingCta: { ...prev.closingCta, ...patch },
    }));
  }

  function handleSave() {
    setError(null);
    startSaving(async () => {
      const result = await saveLandingPageContent(JSON.stringify(content));
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Startseite gespeichert");
    });
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader title="Hero" />
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Eyebrow
            </span>
            <Input
              value={content.hero.eyebrow ?? ""}
              onChange={(event) => updateHero({ eyebrow: event.target.value })}
              placeholder="Leer lassen für keine Eyebrow"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Überschrift
            </span>
            <Input
              value={content.hero.title ?? ""}
              onChange={(event) => updateHero({ title: event.target.value })}
              placeholder="Erklärung statt Aufregung."
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Untertitel
            </span>
            <Textarea
              value={content.hero.subtitle ?? ""}
              onChange={(event) => updateHero({ subtitle: event.target.value })}
              className="min-h-[80px]"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-ink-muted text-[12px] font-medium">
                Primärer Button (Text)
              </span>
              <Input
                value={content.hero.primaryButtonLabel ?? ""}
                onChange={(event) =>
                  updateHero({ primaryButtonLabel: event.target.value })
                }
                placeholder="Check starten"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-ink-muted text-[12px] font-medium">
                Sekundärer Button (Text)
              </span>
              <Input
                value={content.hero.secondaryButtonLabel ?? ""}
                onChange={(event) =>
                  updateHero({ secondaryButtonLabel: event.target.value })
                }
                placeholder="Erst mal verstehen"
              />
            </label>
          </div>
          <ImagePickerField
            label="Bild"
            imageUrl={content.hero.imageUrl}
            imageAlt={content.hero.imageAlt}
            onSelect={(url, alt) =>
              updateHero({ imageUrl: url, imageAlt: alt })
            }
            onAltChange={(alt) => updateHero({ imageAlt: alt })}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Problem-Karten" />
        <div className="flex flex-col gap-5">
          {content.problemCards.map((card, index) => (
            <div
              key={index}
              className="border-line border-t pt-5 first:border-t-0 first:pt-0"
            >
              <p className="text-ink-muted mb-2 text-[13px] font-semibold">
                {PROBLEM_CARD_LABELS[index]}
              </p>
              <div className="flex flex-col gap-3">
                <Input
                  value={card.title ?? ""}
                  onChange={(event) =>
                    updateProblemCard(index, { title: event.target.value })
                  }
                  placeholder="Titel"
                />
                <Textarea
                  value={card.text ?? ""}
                  onChange={(event) =>
                    updateProblemCard(index, { text: event.target.value })
                  }
                  placeholder="Text"
                  className="min-h-[70px]"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {content.splitSections.map((section, index) => (
        <Card key={index}>
          <CardHeader title={SPLIT_SECTION_LABELS[index]} />
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-ink-muted text-[12px] font-medium">
                  Eyebrow
                </span>
                <Input
                  value={section.eyebrow ?? ""}
                  onChange={(event) =>
                    updateSplitSection(index, { eyebrow: event.target.value })
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-ink-muted text-[12px] font-medium">
                  Überschrift
                </span>
                <Input
                  value={section.title ?? ""}
                  onChange={(event) =>
                    updateSplitSection(index, { title: event.target.value })
                  }
                />
              </label>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-ink-muted text-[12px] font-medium">
                Text
              </span>
              <Textarea
                value={section.text ?? ""}
                onChange={(event) =>
                  updateSplitSection(index, { text: event.target.value })
                }
                className="min-h-[80px]"
              />
            </label>
            <div className="flex flex-col gap-2">
              <span className="text-ink-muted text-[12px] font-medium">
                Häkchenliste
              </span>
              {section.checklistItems.map((item, itemIndex) => (
                <Input
                  key={itemIndex}
                  value={item ?? ""}
                  onChange={(event) =>
                    updateChecklistItem(index, itemIndex, event.target.value)
                  }
                  placeholder={`Punkt ${itemIndex + 1}`}
                />
              ))}
            </div>
            <ImagePickerField
              label="Bild"
              imageUrl={section.imageUrl}
              imageAlt={section.imageAlt}
              onSelect={(url, alt) =>
                updateSplitSection(index, { imageUrl: url, imageAlt: alt })
              }
              onAltChange={(alt) =>
                updateSplitSection(index, { imageAlt: alt })
              }
            />
          </div>
        </Card>
      ))}

      <Card>
        <CardHeader title="Abschluss-CTA" />
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Überschrift
            </span>
            <Input
              value={content.closingCta.title ?? ""}
              onChange={(event) =>
                updateClosingCta({ title: event.target.value })
              }
              placeholder="Bereit für ein kurzes Gespräch?"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">Text</span>
            <Textarea
              value={content.closingCta.text ?? ""}
              onChange={(event) =>
                updateClosingCta({ text: event.target.value })
              }
              className="min-h-[70px]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Button (Text)
            </span>
            <Input
              value={content.closingCta.buttonLabel ?? ""}
              onChange={(event) =>
                updateClosingCta({ buttonLabel: event.target.value })
              }
              placeholder="Check starten"
            />
          </label>
        </div>
      </Card>

      {error ? (
        <p role="alert" className="text-danger text-[14px]">
          {error}
        </p>
      ) : null}

      <Button
        variant="primary"
        onClick={handleSave}
        loading={isSaving}
        className="self-start"
      >
        Speichern
      </Button>
    </div>
  );
}
