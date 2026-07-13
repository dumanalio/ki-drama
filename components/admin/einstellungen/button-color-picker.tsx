"use client";

import { contrastRatio, meetsWcagAA, WCAG_AA_RATIO } from "@/lib/contrast";
import { cn } from "@/lib/utils";
import type { LandingButtonColor } from "@/lib/landing-content";

const TOKEN_OPTIONS: {
  value: Exclude<LandingButtonColor, "custom">;
  label: string;
  swatchClass: string;
}[] = [
  { value: "primary", label: "Primär", swatchClass: "bg-ink" },
  { value: "accent", label: "Akzent", swatchClass: "bg-accent" },
  { value: "soft", label: "Sanft", swatchClass: "bg-accent-soft" },
  {
    value: "outline",
    label: "Outline",
    swatchClass: "bg-surface border border-line",
  },
];

const DEFAULT_CUSTOM_COLOR = "#5b4ee3";

export function ButtonColorPicker({
  color,
  customColor,
  onChange,
}: {
  color: LandingButtonColor;
  customColor: string | null;
  onChange: (color: LandingButtonColor, customColor: string | null) => void;
}) {
  const ratio = customColor ? contrastRatio(customColor, "#ffffff") : null;
  const passes = customColor ? meetsWcagAA(customColor) : true;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-ink-muted text-[12px] font-medium">Farbe</span>
      <div className="flex flex-wrap items-center gap-2">
        {TOKEN_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={color === option.value}
            onClick={() => onChange(option.value, null)}
            className={cn(
              "flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors duration-[120ms]",
              color === option.value
                ? "border-accent bg-accent-soft text-accent"
                : "border-line text-ink-soft hover:border-line-strong"
            )}
          >
            <span
              className={cn("size-4 shrink-0 rounded-full", option.swatchClass)}
              aria-hidden="true"
            />
            {option.label}
          </button>
        ))}

        <label
          className={cn(
            "flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors duration-[120ms]",
            color === "custom"
              ? "border-accent bg-accent-soft text-accent"
              : "border-line text-ink-soft hover:border-line-strong"
          )}
        >
          <input
            type="color"
            value={customColor ?? DEFAULT_CUSTOM_COLOR}
            onClick={() => {
              if (color !== "custom") {
                onChange("custom", customColor ?? DEFAULT_CUSTOM_COLOR);
              }
            }}
            onChange={(event) => onChange("custom", event.target.value)}
            className="size-4 shrink-0 cursor-pointer appearance-none overflow-hidden rounded-full border-none bg-transparent p-0"
            aria-label="Eigene Farbe wählen"
          />
          Eigene
        </label>
      </div>

      {color === "custom" ? (
        <p
          className={cn(
            "text-[12px]",
            passes ? "text-ink-muted" : "text-danger"
          )}
        >
          {ratio !== null
            ? `Kontrast zu weißem Text: ${ratio.toFixed(1)}:1${
                passes
                  ? " — gut lesbar"
                  : ` — zu gering, mindestens ${WCAG_AA_RATIO}:1 nötig`
              }`
            : "Bitte eine Farbe wählen."}
        </p>
      ) : null}
    </div>
  );
}
