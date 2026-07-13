"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Trash2 } from "lucide-react";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { toast } from "sonner";

import { SortableList } from "@/components/admin/sortable-list";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/modal";
import {
  deleteQuestion,
  duplicateQuestion,
  reorderQuestions,
} from "@/lib/actions/questions";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types/database";

const TYPE_LABELS: Record<QuizQuestion["type"], string> = {
  single: "Einfachauswahl",
  multi: "Mehrfachauswahl",
  scale: "Skala",
  text: "Freitext",
};

type ViewSegment = "privat" | "business";

const SEGMENT_TOGGLE_LABELS: Record<ViewSegment, string> = {
  privat: "Privat",
  business: "Unternehmen",
};

function QuestionRow({
  question,
  number,
}: {
  question: QuizQuestion;
  number: number;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDeleting, startDeleting] = React.useTransition();
  const [isDuplicating, startDuplicating] = React.useTransition();

  function handleDelete() {
    setError(null);
    startDeleting(async () => {
      const result = await deleteQuestion(question.id);
      setConfirmOpen(false);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Frage gelöscht");
        router.refresh();
      }
    });
  }

  function handleDuplicate() {
    startDuplicating(async () => {
      const result = await duplicateQuestion(question.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        "Frage dupliziert — jetzt für das andere Segment anpassen"
      );
      router.push(`/admin/fragen/${result.id}`);
    });
  }

  return (
    <div className="border-line bg-surface flex items-center justify-between gap-4 rounded-xl border p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-ink-muted w-5 shrink-0 text-right text-[14px] font-medium tabular-nums">
          {number}.
        </span>
        <div className="min-w-0">
          <Link
            href={`/admin/fragen/${question.id}`}
            className="text-ink hover:text-accent focus-visible:ring-accent truncate rounded font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {question.title || "Ohne Titel"}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant="soft">{TYPE_LABELS[question.type]}</Badge>
            {question.segment === "alle" ? (
              <Badge variant="soft">beide</Badge>
            ) : null}
            {!question.active ? <Badge variant="warning">Inaktiv</Badge> : null}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {question.segment !== "alle" ? (
          <Button
            variant="outline"
            size="sm"
            aria-label="Für anderes Segment duplizieren"
            title="Für anderes Segment duplizieren"
            onClick={handleDuplicate}
            loading={isDuplicating}
          >
            <Copy className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
        <Modal open={confirmOpen} onOpenChange={setConfirmOpen}>
          <ModalTrigger
            className={buttonVariants({ variant: "outline", size: "sm" })}
            aria-label="Frage löschen"
          >
            <Trash2 className="size-4" aria-hidden="true" />
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
            {question.title || "Diese Frage"} wird endgültig gelöscht. Das lässt
            sich nicht rückgängig machen.
          </ModalContent>
        </Modal>
      </div>
      {error ? (
        <p role="alert" className="text-danger text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function QuestionList({ questions }: { questions: QuizQuestion[] }) {
  const [items, setItems] = React.useState(questions);
  const [segment, setSegment] = useQueryState(
    "segment",
    parseAsStringEnum<ViewSegment>(["privat", "business"]).withDefault(
      "privat"
    )
  );

  React.useEffect(() => {
    setItems(questions);
  }, [questions]);

  const sortedItems = React.useMemo(
    () => [...items].sort((a, b) => a.position - b.position),
    [items]
  );

  const visibleItems = React.useMemo(
    () => sortedItems.filter((q) => q.segment === "alle" || q.segment === segment),
    [sortedItems, segment]
  );

  function handleReorder(nextVisible: QuizQuestion[]) {
    // Fragen des anderen Segments sind ausgeblendet, behalten aber ihre
    // relative Position -- nur die sichtbare Reihenfolge wird neu verteilt.
    const visibleIds = new Set(nextVisible.map((q) => q.id));
    let cursor = 0;
    const merged = sortedItems.map((q) =>
      visibleIds.has(q.id) ? nextVisible[cursor++] : q
    );

    setItems(merged);
    reorderQuestions(merged.map((item) => item.id)).then((result) => {
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="border-line bg-surface-alt inline-flex w-fit items-center gap-1 rounded-lg border p-1">
          {(["privat", "business"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={segment === value}
              onClick={() => setSegment(value)}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-[14px] font-medium transition-colors duration-[120ms]",
                segment === value
                  ? "bg-surface text-ink shadow-card"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              {SEGMENT_TOGGLE_LABELS[value]}
            </button>
          ))}
        </div>
        <p className="text-ink-muted text-[13px]">
          Zeigt genau die Fragen, die ein Besucher dieses Segments im Check
          sieht — in der richtigen Reihenfolge.
        </p>
      </div>

      {visibleItems.length === 0 ? (
        <p className="text-ink-muted text-[14px]">
          Für dieses Segment sind aktuell keine Fragen sichtbar.
        </p>
      ) : (
        <SortableList
          items={visibleItems}
          onReorder={handleReorder}
          renderItem={(question, index) => (
            <QuestionRow question={question} number={index + 1} />
          )}
        />
      )}
    </div>
  );
}
