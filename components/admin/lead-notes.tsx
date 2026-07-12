"use client";

import * as React from "react";

import { Textarea } from "@/components/ui/textarea";
import { updateLeadNotes } from "@/lib/actions/leads";

const AUTOSAVE_DELAY_MS = 800;

type SaveState = "idle" | "pending" | "saved" | "error";

export function LeadNotes({
  leadId,
  initialNotes,
}: {
  leadId: string;
  initialNotes: string | null;
}) {
  const [value, setValue] = React.useState(initialNotes ?? "");
  const [saveState, setSaveState] = React.useState<SaveState>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = React.useRef(value);
  valueRef.current = value;

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleChange(next: string) {
    setValue(next);
    setSaveState("pending");
    setError(null);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      const result = await updateLeadNotes({
        leadId,
        notes: valueRef.current,
      });
      if (result.ok) {
        setSaveState("saved");
      } else {
        setSaveState("error");
        setError(result.error);
      }
    }, AUTOSAVE_DELAY_MS);
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label
          htmlFor="lead-notes"
          className="text-ink text-[15px] font-medium"
        >
          Notizfeld
        </label>
        <span className="text-ink-muted text-[13px]" aria-live="polite">
          {saveState === "pending"
            ? "Wird gespeichert…"
            : saveState === "saved"
              ? "Gespeichert"
              : saveState === "error"
                ? "Fehler beim Speichern"
                : ""}
        </span>
      </div>
      <Textarea
        id="lead-notes"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Freitext-Notizen zu diesem Lead…"
        className="min-h-[160px]"
        invalid={saveState === "error"}
      />
      {error ? (
        <p role="alert" className="text-danger mt-1.5 text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
