"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { QuestionPreview } from "@/components/admin/fragen/question-preview";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { deleteQuestion, saveQuestion } from "@/lib/actions/questions";
import type {
  QuestionSegment,
  QuestionType,
  QuizQuestion,
} from "@/types/database";

const TYPE_LABELS: Record<QuestionType, string> = {
  single: "Einfachauswahl",
  multi: "Mehrfachauswahl",
  scale: "Skala",
  text: "Freitext",
};

const SEGMENT_LABELS: Record<QuestionSegment, string> = {
  alle: "Alle",
  privat: "Privat",
  business: "Unternehmen",
};

interface OptionRow {
  label: string;
  description: string;
}

export function QuestionForm({ question }: { question: QuizQuestion }) {
  const router = useRouter();

  const [type, setType] = React.useState<QuestionType>(question.type);
  const [segment, setSegment] = React.useState<QuestionSegment>(
    question.segment
  );
  const [title, setTitle] = React.useState(question.title);
  const [hint, setHint] = React.useState(question.hint ?? "");
  const [options, setOptions] = React.useState<OptionRow[]>(
    question.options.map((option) => ({
      label: option.label,
      description: option.description ?? "",
    }))
  );
  const [required, setRequired] = React.useState(question.required);
  const [active, setActive] = React.useState(question.active);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, startSaving] = React.useTransition();
  const [isDeleting, startDeleting] = React.useTransition();

  const showOptions = type === "single" || type === "multi" || type === "scale";

  function updateOption(index: number, patch: Partial<OptionRow>) {
    setOptions((prev) =>
      prev.map((option, i) => (i === index ? { ...option, ...patch } : option))
    );
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    setError(null);
    startSaving(async () => {
      const result = await saveQuestion({
        id: question.id,
        type,
        segment,
        title,
        hint: hint.trim().length > 0 ? hint.trim() : null,
        options: showOptions
          ? options.map((option) => ({
              label: option.label,
              description:
                option.description.trim().length > 0
                  ? option.description.trim()
                  : null,
            }))
          : [],
        required,
        active,
      });
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Frage gespeichert");
      router.push("/admin/fragen");
    });
  }

  function handleDelete() {
    startDeleting(async () => {
      const result = await deleteQuestion(question.id);
      if (result.ok) {
        toast.success("Frage gelöscht");
        router.push("/admin/fragen");
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <AdminPageHeader
        title={title || "Ohne Titel"}
        action={
          <Button variant="primary" onClick={handleSave} loading={isSaving}>
            Speichern
          </Button>
        }
      />

      <Link
        href="/admin/fragen"
        className="text-ink-muted hover:text-ink mb-6 inline-flex items-center gap-1.5 text-[14px]"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Zurück zur Liste
      </Link>

      {error ? (
        <p role="alert" className="text-danger mb-4 text-[14px]">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border-line bg-surface shadow-card rounded-xl border p-5">
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-ink-muted text-[12px] font-medium">
                  Typ
                </span>
                <Select
                  value={type}
                  onValueChange={(value) =>
                    value && setType(value as QuestionType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-ink-muted text-[12px] font-medium">
                  Segment
                </span>
                <Select
                  value={segment}
                  onValueChange={(value) =>
                    value && setSegment(value as QuestionSegment)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SEGMENT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-ink-muted text-[12px] font-medium">
                Titel
              </span>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-ink-muted text-[12px] font-medium">
                Hinweis
              </span>
              <Textarea
                value={hint}
                onChange={(event) => setHint(event.target.value)}
                className="min-h-[60px]"
              />
            </label>

            {showOptions ? (
              <div className="flex flex-col gap-2">
                <span className="text-ink-muted text-[12px] font-medium">
                  Optionen
                </span>
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="border-line flex gap-2 rounded-lg border p-3"
                  >
                    <div className="flex flex-1 flex-col gap-2">
                      <Input
                        value={option.label}
                        onChange={(event) =>
                          updateOption(index, { label: event.target.value })
                        }
                        placeholder="Beschriftung"
                      />
                      <Input
                        value={option.description}
                        onChange={(event) =>
                          updateOption(index, {
                            description: event.target.value,
                          })
                        }
                        placeholder="Beschreibung (optional)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      aria-label="Option entfernen"
                      className="text-ink-muted hover:text-danger flex size-9 shrink-0 items-center justify-center self-start rounded-lg"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() =>
                    setOptions((prev) => [
                      ...prev,
                      { label: "", description: "" },
                    ])
                  }
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Option hinzufügen
                </Button>
              </div>
            ) : null}

            <div className="border-line flex flex-col gap-3 border-t pt-4">
              <Checkbox
                checked={required}
                onCheckedChange={(checked) => setRequired(checked)}
                label="Pflichtfeld"
              />
              <Checkbox
                checked={active}
                onCheckedChange={(checked) => setActive(checked)}
                label="Aktiv (im Check sichtbar)"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-ink-muted mb-2 text-[13px] font-medium">
            Live-Vorschau
          </p>
          <QuestionPreview
            type={type}
            title={title}
            hint={hint.trim().length > 0 ? hint : null}
            options={options.map((option) => ({
              label: option.label,
              description:
                option.description.trim().length > 0
                  ? option.description
                  : null,
            }))}
            required={required}
          />
        </div>
      </div>

      <Modal>
        <ModalTrigger
          className={`${buttonVariants({ variant: "outline" })} mt-6`}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Frage löschen
        </ModalTrigger>
        <ModalContent
          title="Frage löschen?"
          footer={
            <>
              <ModalClose className={buttonVariants({ variant: "outline" })}>
                Zurück
              </ModalClose>
              <Button
                variant="primary"
                onClick={handleDelete}
                loading={isDeleting}
              >
                Ja, löschen
              </Button>
            </>
          }
        >
          Diese Frage wird endgültig gelöscht. Das lässt sich nicht rückgängig
          machen.
        </ModalContent>
      </Modal>
    </>
  );
}
