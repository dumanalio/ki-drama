"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = React.useState("");

  function commitDraft() {
    const trimmed = draft.trim();
    if (trimmed.length > 0 && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  }

  return (
    <div className="border-line bg-surface focus-within:border-accent flex flex-wrap items-center gap-1.5 rounded-lg border p-2">
      {value.map((tag) => (
        <Badge key={tag} variant="soft" className="gap-1 pr-1.5">
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((item) => item !== tag))}
            aria-label={`${tag} entfernen`}
            className="hover:bg-accent/20 flex size-4 items-center justify-center rounded-full"
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </Badge>
      ))}
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commitDraft();
          } else if (
            event.key === "Backspace" &&
            draft === "" &&
            value.length > 0
          ) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={commitDraft}
        placeholder={value.length === 0 ? placeholder : undefined}
        className="text-ink placeholder:text-ink-muted min-w-[100px] flex-1 bg-transparent px-1 py-1 text-[14px] outline-none"
      />
    </div>
  );
}
