"use client";

import { contrastRatio, meetsWcagAA, WCAG_AA_RATIO } from "@/lib/contrast";
import { cn } from "@/lib/utils";
import type { LandingTextColor } from "@/lib/landing-content";

const DEFAULT_CUSTOM_COLOR = "#ffffff";

/** Reine Textfarben-Wahl (kein Hintergrund) -- Kontrast wird gegen einen festen, mitgegebenen Hintergrund geprüft. */
export function TextColorPicker({
  color,
  customColor,
  backgroundHex,
  onChange,
}: {
  color: LandingTextColor;
  customColor: string | null;
  backgroundHex: string;
  onChange: (color: LandingTextColor, customColor: string | null) => void;
}) {
  const ratio =
    color === "custom" && customColor ? contrastRatio(customColor, backgroundHex) : null;
  const passes =
    color === "custom" && customColor ? meetsWcagAA(customColor, backgroundHex) : true;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={color === "auto"}
          onClick={() => onChange("auto", null)}
          className={cn(
            "flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors duration-[120ms]",
            color === "auto"
              ? "border-accent bg-accent-soft text-accent"
              : "border-line text-ink-soft hover:border-line-strong"
          )}
        >
          Automatisch
        </button>

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
        <p className={cn("text-[12px]", passes ? "text-ink-muted" : "text-danger")}>
          {customColor
            ? `Kontrast zum Hintergrund: ${ratio?.toFixed(1)}:1${
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
