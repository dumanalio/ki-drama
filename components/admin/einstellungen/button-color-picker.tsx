"use client";

import { contrastRatio, meetsWcagAA, WCAG_AA_RATIO } from "@/lib/contrast";
import { resolveButtonBackgroundHex } from "@/lib/button-color";
import { cn } from "@/lib/utils";
import type { LandingButtonColor, LandingTextColor } from "@/lib/landing-content";

const BG_OPTIONS: {
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

const DEFAULT_CUSTOM_BG = "#5b4ee3";
const DEFAULT_CUSTOM_TEXT = "#1e1b39";

export interface ButtonColorValue {
  color: LandingButtonColor;
  customColor: string | null;
  textColor: LandingTextColor;
  textCustomColor: string | null;
}

export function ButtonColorPicker({
  value,
  onChange,
}: {
  value: ButtonColorValue;
  onChange: (value: ButtonColorValue) => void;
}) {
  const { color, customColor, textColor, textCustomColor } = value;
  const backgroundHex = resolveButtonBackgroundHex(color, customColor);
  const bgPasses = color === "custom" && customColor ? meetsWcagAA(customColor) : true;
  const textRatio =
    textColor === "custom" && textCustomColor
      ? contrastRatio(textCustomColor, backgroundHex)
      : null;
  const textPasses =
    textColor === "custom" && textCustomColor
      ? meetsWcagAA(textCustomColor, backgroundHex)
      : true;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <span className="text-ink-muted text-[12px] font-medium">
          Hintergrund
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {BG_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={color === option.value}
              onClick={() => onChange({ ...value, color: option.value, customColor: null })}
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
              value={customColor ?? DEFAULT_CUSTOM_BG}
              onClick={() => {
                if (color !== "custom") {
                  onChange({ ...value, color: "custom", customColor: customColor ?? DEFAULT_CUSTOM_BG });
                }
              }}
              onChange={(event) =>
                onChange({ ...value, color: "custom", customColor: event.target.value })
              }
              className="size-4 shrink-0 cursor-pointer appearance-none overflow-hidden rounded-full border-none bg-transparent p-0"
              aria-label="Eigene Hintergrundfarbe wählen"
            />
            Eigene
          </label>
        </div>

        {color === "custom" && textColor === "auto" ? (
          <p className={cn("text-[12px]", bgPasses ? "text-ink-muted" : "text-danger")}>
            {customColor
              ? `Kontrast zu weißem Text: ${contrastRatio(customColor, "#ffffff")?.toFixed(1)}:1${
                  bgPasses
                    ? " — gut lesbar"
                    : ` — zu gering, mindestens ${WCAG_AA_RATIO}:1 nötig`
                }`
              : "Bitte eine Farbe wählen."}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-ink-muted text-[12px] font-medium">Schrift</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={textColor === "auto"}
            onClick={() => onChange({ ...value, textColor: "auto", textCustomColor: null })}
            className={cn(
              "flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors duration-[120ms]",
              textColor === "auto"
                ? "border-accent bg-accent-soft text-accent"
                : "border-line text-ink-soft hover:border-line-strong"
            )}
          >
            Automatisch
          </button>

          <label
            className={cn(
              "flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors duration-[120ms]",
              textColor === "custom"
                ? "border-accent bg-accent-soft text-accent"
                : "border-line text-ink-soft hover:border-line-strong"
            )}
          >
            <input
              type="color"
              value={textCustomColor ?? DEFAULT_CUSTOM_TEXT}
              onClick={() => {
                if (textColor !== "custom") {
                  onChange({
                    ...value,
                    textColor: "custom",
                    textCustomColor: textCustomColor ?? DEFAULT_CUSTOM_TEXT,
                  });
                }
              }}
              onChange={(event) =>
                onChange({ ...value, textColor: "custom", textCustomColor: event.target.value })
              }
              className="size-4 shrink-0 cursor-pointer appearance-none overflow-hidden rounded-full border-none bg-transparent p-0"
              aria-label="Eigene Schriftfarbe wählen"
            />
            Eigene
          </label>
        </div>

        {textColor === "custom" ? (
          <p className={cn("text-[12px]", textPasses ? "text-ink-muted" : "text-danger")}>
            {textCustomColor
              ? `Kontrast zum Hintergrund: ${textRatio?.toFixed(1)}:1${
                  textPasses
                    ? " — gut lesbar"
                    : ` — zu gering, mindestens ${WCAG_AA_RATIO}:1 nötig`
                }`
              : "Bitte eine Farbe wählen."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
