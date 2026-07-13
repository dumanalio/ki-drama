"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { ButtonColorPicker } from "@/components/admin/einstellungen/button-color-picker";
import { ImagePickerField } from "@/components/admin/einstellungen/image-picker-field";
import { SectionEditor } from "@/components/admin/einstellungen/section-editor";
import { SortableList } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveLandingPageContent } from "@/lib/actions/settings";
import { createEmptySection } from "@/lib/landing-content";
import type { LandingPageContent, LandingSection } from "@/lib/landing-content";

const AUTOSAVE_DELAY_MS = 1200;

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function LandingPageForm({
  content: initial,
}: {
  content: LandingPageContent;
}) {
  const [content, setContent] = React.useState(initial);
  const [error, setError] = React.useState<string | null>(null);
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");
  const [dirty, setDirty] = React.useState(false);
  const contentRef = React.useRef(content);
  contentRef.current = content;

  const save = React.useCallback(async (announce = false) => {
    setSaveStatus("saving");
    setError(null);
    const result = await saveLandingPageContent(
      JSON.stringify(contentRef.current)
    );
    if (!result.ok) {
      setSaveStatus("error");
      setError(result.error);
      toast.error(result.error);
      return;
    }
    setSaveStatus("saved");
    setDirty(false);
    if (announce) toast.success("Startseite gespeichert");
  }, []);

  // Debounced Autosave: speichert kurz nach der letzten Änderung.
  React.useEffect(() => {
    if (!dirty) return;
    const timeout = setTimeout(() => {
      void save();
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [dirty, content, save]);

  function update(patch: Partial<LandingPageContent>) {
    setContent((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }

  function updateHero(patch: Partial<LandingPageContent["hero"]>) {
    update({ hero: { ...content.hero, ...patch } });
  }

  function updateClosingCta(patch: Partial<LandingPageContent["closingCta"]>) {
    update({ closingCta: { ...content.closingCta, ...patch } });
  }

  function updateSection(id: string, patch: Partial<LandingSection>) {
    update({
      sections: content.sections.map((section) =>
        section.id === id ? { ...section, ...patch } : section
      ),
    });
  }

  function addSection() {
    update({ sections: [...content.sections, createEmptySection()] });
    toast.success("Abschnitt hinzugefügt");
  }

  function deleteSection(id: string) {
    update({ sections: content.sections.filter((s) => s.id !== id) });
    toast.success("Abschnitt gelöscht");
  }

  function reorderSections(next: LandingSection[]) {
    update({ sections: next });
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
            <div className="flex flex-col gap-3">
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
              <ButtonColorPicker
                color={content.hero.primaryButtonColor}
                customColor={content.hero.primaryButtonCustomColor}
                onChange={(color, customColor) =>
                  updateHero({
                    primaryButtonColor: color,
                    primaryButtonCustomColor: customColor,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-3">
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
              <ButtonColorPicker
                color={content.hero.secondaryButtonColor}
                customColor={content.hero.secondaryButtonCustomColor}
                onChange={(color, customColor) =>
                  updateHero({
                    secondaryButtonColor: color,
                    secondaryButtonCustomColor: customColor,
                  })
                }
              />
            </div>
          </div>
          <ImagePickerField
            label="Bild"
            imageUrl={content.hero.imageUrl}
            imageAlt={content.hero.imageAlt}
            onSelect={(url, alt) => updateHero({ imageUrl: url, imageAlt: alt })}
            onAltChange={(alt) => updateHero({ imageAlt: alt })}
            onRemove={() => updateHero({ imageUrl: null, imageAlt: null })}
          />
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
              Abschnitte
            </h3>
            <p className="text-ink-muted text-[13px]">
              Beliebig viele, sortierbar per Drag & Drop.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addSection}>
            <Plus className="size-4" aria-hidden="true" />
            Abschnitt hinzufügen
          </Button>
        </div>

        {content.sections.length === 0 ? (
          <p className="text-ink-muted border-line rounded-xl border border-dashed p-6 text-center text-[14px]">
            Noch keine eigenen Abschnitte — die Startseite zeigt bis dahin die
            Standardabschnitte.
          </p>
        ) : (
          <SortableList
            items={content.sections}
            onReorder={reorderSections}
            renderItem={(section) => (
              <SectionEditor
                section={section}
                onChange={(patch) => updateSection(section.id, patch)}
                onDelete={() => deleteSection(section.id)}
              />
            )}
          />
        )}
      </div>

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
          <ButtonColorPicker
            color={content.closingCta.buttonColor}
            customColor={content.closingCta.buttonCustomColor}
            onChange={(color, customColor) =>
              updateClosingCta({
                buttonColor: color,
                buttonCustomColor: customColor,
              })
            }
          />
        </div>
      </Card>

      {error ? (
        <p role="alert" className="text-danger text-[14px]">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          onClick={() => void save(true)}
          loading={saveStatus === "saving"}
        >
          Jetzt speichern
        </Button>
        <span className="text-ink-muted text-[13px]" aria-live="polite">
          {saveStatus === "saving"
            ? "Wird gespeichert…"
            : saveStatus === "saved"
              ? "Gespeichert"
              : saveStatus === "error"
                ? "Fehler beim Speichern"
                : ""}
        </span>
      </div>
    </div>
  );
}
