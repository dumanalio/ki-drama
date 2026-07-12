import Link from "next/link";
import { HelpCircle, Plus } from "lucide-react";

import { QuestionList } from "@/components/admin/fragen/question-list";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { getQuestionsForList } from "@/lib/queries/admin-questions";

export default async function AdminFragenPage() {
  let questions: Awaited<ReturnType<typeof getQuestionsForList>> = [];
  let loadError = false;

  try {
    questions = await getQuestionsForList();
  } catch {
    loadError = true;
  }

  return (
    <>
      <AdminPageHeader
        title="Fragen"
        action={
          <Link
            href="/admin/fragen/neu"
            className={buttonVariants({ variant: "primary" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            Neue Frage
          </Link>
        }
      />

      {loadError ? (
        <ErrorState
          title="Fragen konnten nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="Noch keine Fragen"
          description="Lege die erste Check-Frage an."
        />
      ) : (
        <QuestionList questions={questions} />
      )}
    </>
  );
}
