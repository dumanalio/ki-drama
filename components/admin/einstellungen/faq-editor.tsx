"use client";

import { Plus, Trash2 } from "lucide-react";

import { ScaledPreview } from "@/components/admin/einstellungen/scaled-preview";
import { SortableList } from "@/components/admin/sortable-list";
import { LandingFaqView } from "@/components/site/landing-faq-view";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createEmptyFaqItem } from "@/lib/landing-content";
import type { FaqDisplayStyle, LandingFaq } from "@/lib/landing-content";

const DISPLAY_OPTIONS: { value: FaqDisplayStyle; label: string }[] = [
  { value: "accordion", label: "Akkordeon" },
  { value: "grid", label: "Zwei-Spalten-Raster" },
  { value: "numbered", label: "Nummerierte Liste" },
];

export function FaqEditor({
  faq,
  onChange,
}: {
  faq: LandingFaq;
  onChange: (patch: Partial<LandingFaq>) => void;
}) {
  function updateItem(index: number, patch: Partial<LandingFaq["items"][number]>) {
    onChange({
      items: faq.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
  }

  function addItem() {
    onChange({ items: [...faq.items, createEmptyFaqItem()] });
  }

  function removeItem(index: number) {
    onChange({ items: faq.items.filter((_, i) => i !== index) });
  }

  return (
    <Card>
      <CardHeader title="FAQ" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Überschrift (optional)
            </span>
            <Input
              value={faq.title ?? ""}
              onChange={(event) => onChange({ title: event.target.value })}
              placeholder="Häufige Fragen"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-ink-muted text-[12px] font-medium">
              Darstellung
            </span>
            <div className="flex flex-wrap gap-2">
              {DISPLAY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={faq.displayStyle === option.value}
                  onClick={() => onChange({ displayStyle: option.value })}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors duration-[120ms]",
                    faq.displayStyle === option.value
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line text-ink-soft hover:border-line-strong"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-ink-muted text-[12px] font-medium">
              Fragen
            </span>
            {faq.items.length === 0 ? (
              <p className="text-ink-muted border-line rounded-lg border border-dashed p-4 text-center text-[13px]">
                Noch keine Fragen -- unten hinzufügen.
              </p>
            ) : (
              <SortableList
                items={faq.items}
                onReorder={(items) => onChange({ items })}
                renderItem={(item, index) => (
                  <div className="border-line bg-surface flex flex-col gap-2 rounded-lg border p-3">
                    <Input
                      value={item.question ?? ""}
                      onChange={(event) =>
                        updateItem(index, { question: event.target.value })
                      }
                      placeholder="Frage"
                    />
                    <Textarea
                      value={item.answer ?? ""}
                      onChange={(event) =>
                        updateItem(index, { answer: event.target.value })
                      }
                      placeholder="Antwort"
                      className="min-h-[70px]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Entfernen
                    </Button>
                  </div>
                )}
              />
            )}
            <Button variant="outline" size="sm" className="w-fit" onClick={addItem}>
              <Plus className="size-4" aria-hidden="true" />
              Frage hinzufügen
            </Button>
          </div>
        </div>

        <div>
          <p className="text-ink-muted mb-2 text-[13px] font-medium">
            Live-Vorschau
          </p>
          <div className="border-line bg-canvas overflow-hidden rounded-xl border">
            <ScaledPreview>
              <div className="mx-auto max-w-[1200px] px-6 py-14">
                <LandingFaqView faq={faq} />
              </div>
            </ScaledPreview>
          </div>
        </div>
      </div>
    </Card>
  );
}
