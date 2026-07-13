"use client";

import { ButtonColorPicker } from "@/components/admin/einstellungen/button-color-picker";
import { ImagePickerField } from "@/components/admin/einstellungen/image-picker-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LandingSectionColumn } from "@/lib/landing-content";

export function ColumnEditor({
  column,
  index,
  onChange,
}: {
  column: LandingSectionColumn;
  index: number;
  onChange: (patch: Partial<LandingSectionColumn>) => void;
}) {
  function toggleButton(enabled: boolean) {
    onChange({
      button: enabled
        ? { label: "", href: "", color: "soft", customColor: null }
        : null,
    });
  }

  function updateButton(
    patch: Partial<NonNullable<LandingSectionColumn["button"]>>
  ) {
    if (!column.button) return;
    onChange({ button: { ...column.button, ...patch } });
  }

  return (
    <div className="border-line flex flex-col gap-3 rounded-lg border p-4">
      <span className="text-ink-muted text-[12px] font-semibold tracking-[0.04em] uppercase">
        Spalte {index + 1}
      </span>

      <ImagePickerField
        label="Bild"
        imageUrl={column.imageUrl}
        imageAlt={column.imageAlt}
        onSelect={(url, alt) => onChange({ imageUrl: url, imageAlt: alt })}
        onAltChange={(alt) => onChange({ imageAlt: alt })}
        onRemove={() => onChange({ imageUrl: null, imageAlt: null })}
      />

      <label className="flex flex-col gap-1">
        <span className="text-ink-muted text-[12px] font-medium">
          Überschrift
        </span>
        <Input
          value={column.title ?? ""}
          onChange={(event) => onChange({ title: event.target.value })}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-ink-muted text-[12px] font-medium">Text</span>
        <Textarea
          value={column.text ?? ""}
          onChange={(event) => onChange({ text: event.target.value })}
          className="min-h-[70px]"
        />
      </label>

      <div className="flex flex-col gap-3">
        <Checkbox
          checked={column.button !== null}
          onCheckedChange={toggleButton}
          label="Button anzeigen"
        />
        {column.button ? (
          <div className="flex flex-col gap-3 pl-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-ink-muted text-[12px] font-medium">
                  Beschriftung
                </span>
                <Input
                  value={column.button.label ?? ""}
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
                  value={column.button.href ?? ""}
                  onChange={(event) =>
                    updateButton({ href: event.target.value })
                  }
                  placeholder="/check oder https://…"
                />
              </label>
            </div>
            <ButtonColorPicker
              color={column.button.color}
              customColor={column.button.customColor}
              onChange={(color, customColor) =>
                updateButton({ color, customColor })
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
