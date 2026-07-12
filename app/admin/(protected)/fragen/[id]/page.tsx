import { notFound } from "next/navigation";

import { QuestionForm } from "@/components/admin/fragen/question-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { getQuestionById } from "@/lib/queries/admin-questions";

export default async function AdminQuestionEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let question: Awaited<ReturnType<typeof getQuestionById>> = null;
  let loadError = false;

  try {
    question = await getQuestionById(id);
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <>
        <AdminPageHeader title="Frage" />
        <ErrorState
          title="Frage konnte nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      </>
    );
  }

  if (!question) notFound();

  return <QuestionForm question={question} />;
}
