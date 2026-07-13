"use client";

import { PanelLeft, PanelRight, PanelTop, Plus, Trash2, Type, X } from "lucide-react";

import { ButtonColorPicker } from "@/components/admin/einstellungen/button-color-picker";
import { ImagePickerField } from "@/components/admin/einstellungen/image-picker-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LandingSectionView } from "@/components/site/landing-section-view";
import { cn } from "@/lib/utils";
import type { LandingSection, LandingSectionLayout } from "@/lib/landing-content";

const LAYOUT_OPTIONS: {
  value: LandingSectionLayout;
  label: string;
  icon: typeof PanelLeft;
}[] = [
  { value: "image-left", label: "Bild links", icon: PanelLeft },
  { value: "image-right", label: "Bild rechts", icon: PanelRight },
  { value: "image-top", label: "Bild oben", icon: PanelTop },
  { value: "no-image", label: "Kein Bild", icon: Type },
];

export function SectionEditor({
  section,
  onChange,
  onDelete,
}: {
  section: LandingSection;
  onChange: (patch: Partial<LandingSection>) => void;
  onDelete: () => void;
}) {
  function updateChecklistItem(index: number, value: string) {
    onChange({
      checklistItems: section.checklistItems.map((item, i) =>
        i === index ? value : item
      ),
    });
  }

  function addChecklistItem() {
    onChange({ checklistItems: [...section.checklistItems, ""] });
  }

  function removeChecklistItem(index: number) {
    onChange({
      checklistItems: section.checklistItems.filter((_, i) => i !== index),
    });
  }

  function toggleButton(enabled: boolean) {
    onChange({
      button: enabled
        ? { label: "", href: "", color: "soft", customColor: null }
        : null,
    });
  }

  function updateButton(patch: Partial<NonNullable<LandingSection["button"]>>) {
    if (!section.button) return;
    onChange({ button: { ...section.button, ...patch } });
  }

  return (
    <div className="border-line bg-surface rounded-xl border p-5">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-ink-muted text-[12px] font-medium">
              Layout
            </span>
            <div className="flex flex-wrap gap-2">
              {LAYOUT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={section.layout === option.value}
                  onClick={() => onChange({ layout: option.value })}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors duration-[120ms]",
                    section.layout === option.value
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line text-ink-soft hover:border-line-strong"
                  )}
                >
                  <option.icon className="size-4" aria-hidden="true" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Eyebrow
            </span>
            <Input
              value={section.eyebrow ?? ""}
              onChange={(event) => onChange({ eyebrow: event.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Überschrift
            </span>
            <Input
              value={section.title ?? ""}
              onChange={(event) => onChange({ title: event.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Text
            </span>
            <Textarea
              value={section.text ?? ""}
              onChange={(event) => onChange({ text: event.target.value })}
              className="min-h-[80px]"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-ink-muted text-[12px] font-medium">
              Häkchenliste (optional)
            </span>
            {section.checklistItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item ?? ""}
                  onChange={(event) =>
                    updateChecklistItem(index, event.target.value)
                  }
                  placeholder={`Punkt ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeChecklistItem(index)}
                  aria-label="Punkt entfernen"
                  className="text-ink-muted hover:text-danger flex size-9 shrink-0 items-center justify-center rounded-lg"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={addChecklistItem}
            >
              <Plus className="size-4" aria-hidden="true" />
              Punkt hinzufügen
            </Button>
          </div>

          {section.layout !== "no-image" ? (
            <ImagePickerField
              label="Bild"
              imageUrl={section.imageUrl}
              imageAlt={section.imageAlt}
              onSelect={(url, alt) =>
                onChange({ imageUrl: url, imageAlt: alt })
              }
              onAltChange={(alt) => onChange({ imageAlt: alt })}
              onRemove={() => onChange({ imageUrl: null, imageAlt: null })}
            />
          ) : null}

          <div className="border-line flex flex-col gap-3 border-t pt-4">
            <Checkbox
              checked={section.button !== null}
              onCheckedChange={toggleButton}
              label="Button anzeigen"
            />
            {section.button ? (
              <div className="flex flex-col gap-3 pl-1">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-ink-muted text-[12px] font-medium">
                      Beschriftung
                    </span>
                    <Input
                      value={section.button.label ?? ""}
                      onChange={(event) =>
                        updateButton({ label: event.target.value })
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-ink-muted text-[12px] font-medium">
                      Ziel-Link
                    </span>
                    <Input
                      value={section.button.href ?? ""}
                      onChange={(event) =>
                        updateButton({ href: event.target.value })
                      }
                      placeholder="/check oder https://…"
                    />
                  </label>
                </div>
                <ButtonColorPicker
                  color={section.button.color}
                  customColor={section.button.customColor}
                  onChange={(color, customColor) =>
                    updateButton({ color, customColor })
                  }
                />
              </div>
            ) : null}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={onDelete}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Abschnitt löschen
          </Button>
        </div>

        <div>
          <p className="text-ink-muted mb-2 text-[13px] font-medium">
            Live-Vorschau
          </p>
          <div className="border-line bg-canvas overflow-hidden rounded-xl border p-4">
            <LandingSectionView section={section} />
          </div>
        </div>
      </div>
    </div>
  );
}
