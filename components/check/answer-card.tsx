import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AnswerCardProps {
  label: string;
  description?: string;
  selected: boolean;
  multi?: boolean;
  shortcutNumber?: number;
  onSelect: () => void;
}

export function AnswerCard({
  label,
  description,
  selected,
  multi,
  shortcutNumber,
  onSelect,
}: AnswerCardProps) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "relative flex w-full flex-col gap-1 rounded-xl border border-line bg-surface p-5 text-left transition-colors duration-[120ms] outline-none",
        "hover:border-line-strong",
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        selected && "border-accent bg-accent-soft"
      )}
    >
      <span
        className={cn(
          "absolute top-4 right-4 flex size-5 items-center justify-center border border-line bg-surface",
          multi ? "rounded-md" : "rounded-full",
          selected && "border-accent bg-accent"
        )}
        aria-hidden="true"
      >
        {selected ? (
          <Check className="size-3.5" strokeWidth={3} color="white" />
        ) : null}
      </span>

      {shortcutNumber ? (
        <span className="text-[13px] font-medium text-ink-muted">
          {shortcutNumber}
        </span>
      ) : null}

      <span className="pr-8 text-[18px] font-semibold text-ink">{label}</span>
      {description ? (
        <span className="text-[15px] leading-relaxed text-ink-soft">
          {description}
        </span>
      ) : null}
    </button>
  );
}
