import { CheckFunnel } from "@/components/check/check-funnel";
import { ErrorState } from "@/components/ui/error-state";
import { getActiveQuizQuestions } from "@/lib/queries/content";
import type { QuizQuestion } from "@/types/database";

export default async function CheckPage() {
  let questions: QuizQuestion[] = [];
  let loadError = false;

  try {
    questions = await getActiveQuizQuestions();
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <ErrorState
          title="Der Check konnte nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      </div>
    );
  }

  return <CheckFunnel questions={questions} />;
}
