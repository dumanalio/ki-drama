"use client";

import * as React from "react";

import { AnswerCard } from "@/components/check/answer-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QuestionType } from "@/types/database";

export interface PreviewOption {
  label: string;
  description: string | null;
  iconUrl: string | null;
  iconAlt: string | null;
}

export function QuestionPreview({
  type,
  title,
  hint,
  options,
  required,
}: {
  type: QuestionType;
  title: string;
  hint: string | null;
  options: PreviewOption[];
  required: boolean;
}) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    setSelected([]);
    setText("");
  }, [type]);

  const hasAnswer =
    type === "text" ? text.trim().length > 0 : selected.length > 0;

  return (
    <div className="border-line bg-canvas rounded-xl border p-6">
      <div className="mx-auto flex max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-ink text-[22px] font-bold tracking-[-0.015em]">
            {title || "Ohne Titel"}
          </h3>
          {hint ? <p className="text-ink-muted text-[14px]">{hint}</p> : null}
        </div>

        {type === "text" ? (
          <div className="flex flex-col gap-4">
            <Input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Deine Antwort"
            />
            <Button
              variant="primary"
              disabled={required && !hasAnswer}
              className="self-end"
            >
              Weiter
            </Button>
          </div>
        ) : options.length === 0 ? (
          <p className="text-ink-muted text-[14px]">
            Noch keine Optionen hinzugefügt.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3">
              {options.map((option, index) => (
                <AnswerCard
                  key={index}
                  label={option.label || `Option ${index + 1}`}
                  description={option.description ?? undefined}
                  iconUrl={option.iconUrl ?? undefined}
                  iconAlt={option.iconAlt ?? undefined}
                  selected={selected.includes(String(index))}
                  multi={type === "multi"}
                  shortcutNumber={index + 1}
                  onSelect={() =>
                    setSelected((prev) =>
                      type === "multi"
                        ? prev.includes(String(index))
                          ? prev.filter((value) => value !== String(index))
                          : [...prev, String(index)]
                        : [String(index)]
                    )
                  }
                />
              ))}
            </div>
            {type === "multi" ? (
              <Button
                variant="primary"
                disabled={required && !hasAnswer}
                className="self-end"
              >
                Weiter
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
