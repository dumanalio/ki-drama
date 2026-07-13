import * as React from "react";
import Image from "next/image";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AnswerCardProps {
  label: string;
  description?: string;
  iconUrl?: string;
  iconAlt?: string;
  selected: boolean;
  multi?: boolean;
  shortcutNumber?: number;
  onSelect: () => void;
}

export function AnswerCard({
  label,
  description,
  iconUrl,
  iconAlt,
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
        "border-line bg-surface relative flex w-full flex-col gap-1 rounded-xl border p-5 text-left transition-colors duration-[120ms] outline-none",
        "hover:border-line-strong",
        "focus-visible:ring-accent focus-visible:ring-2 focus-visible:ring-offset-2",
        selected && "border-accent bg-accent-soft"
      )}
    >
      <span
        className={cn(
          "border-line bg-surface absolute top-4 right-4 flex size-5 items-center justify-center border",
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
        <span className="text-ink-muted text-[13px] font-medium">
          {shortcutNumber}
        </span>
      ) : null}

      {iconUrl ? (
        <Image
          src={iconUrl}
          alt={iconAlt ?? ""}
          width={64}
          height={64}
          className="size-16 rounded-md object-cover"
        />
      ) : null}

      <span className="text-ink pr-8 text-[18px] font-semibold">{label}</span>
      {description ? (
        <span className="text-ink-soft text-[15px] leading-relaxed">
          {description}
        </span>
      ) : null}
    </button>
  );
}
