"use client";

import * as React from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
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
import { deleteQuestion, reorderQuestions } from "@/lib/actions/questions";
import type { QuizQuestion } from "@/types/database";

const TYPE_LABELS: Record<QuizQuestion["type"], string> = {
  single: "Einfachauswahl",
  multi: "Mehrfachauswahl",
  scale: "Skala",
  text: "Freitext",
};

const SEGMENT_LABELS: Record<QuizQuestion["segment"], string> = {
  alle: "Alle",
  privat: "Privat",
  business: "Unternehmen",
};

function QuestionRow({ question }: { question: QuizQuestion }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDeleting, startDeleting] = React.useTransition();

  function handleDelete() {
    setError(null);
    startDeleting(async () => {
      const result = await deleteQuestion(question.id);
      if (!result.ok) {
        setError(result.error);
        setConfirmOpen(false);
        toast.error(result.error);
      } else {
        toast.success("Frage gelöscht");
      }
    });
  }

  return (
    <div className="border-line bg-surface flex items-center justify-between gap-4 rounded-xl border p-4">
      <div className="min-w-0">
        <Link
          href={`/admin/fragen/${question.id}`}
          className="text-ink hover:text-accent focus-visible:ring-accent truncate rounded font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {question.title || "Ohne Titel"}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge variant="soft">{TYPE_LABELS[question.type]}</Badge>
          <Badge variant="soft">{SEGMENT_LABELS[question.segment]}</Badge>
          {!question.active ? <Badge variant="warning">Inaktiv</Badge> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
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

  function handleReorder(next: QuizQuestion[]) {
    setItems(next);
    reorderQuestions(next.map((item) => item.id)).then((result) => {
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <SortableList
      items={items}
      onReorder={handleReorder}
      renderItem={(question) => <QuestionRow question={question} />}
    />
  );
}
