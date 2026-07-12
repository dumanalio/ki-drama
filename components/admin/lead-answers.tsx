import { Badge } from "@/components/ui/badge";
import type { AnsweredQuestion } from "@/lib/queries/admin-lead-detail";

function resolveLabel(
  options: AnsweredQuestion["question"]["options"],
  value: unknown
): string {
  if (typeof value !== "string" && typeof value !== "number")
    return String(value);
  const match = options.find((option) => option.value === String(value));
  return match?.label ?? String(value);
}

function AnswerValue({ entry }: { entry: AnsweredQuestion }) {
  const { question, rawAnswer } = entry;

  if (question.type === "multi" && Array.isArray(rawAnswer)) {
    if (rawAnswer.length === 0) {
      return <span className="text-ink-muted text-[14px]">Keine Auswahl</span>;
    }
    return (
      <div className="flex flex-wrap gap-1.5">
        {rawAnswer.map((value, index) => (
          <Badge key={index} variant="soft">
            {resolveLabel(question.options, value)}
          </Badge>
        ))}
      </div>
    );
  }

  if (
    (question.type === "single" || question.type === "scale") &&
    (typeof rawAnswer === "string" || typeof rawAnswer === "number")
  ) {
    return (
      <span className="text-ink text-[15px]">
        {resolveLabel(question.options, rawAnswer)}
      </span>
    );
  }

  if (typeof rawAnswer === "string") {
    return <p className="text-ink text-[15px] leading-relaxed">{rawAnswer}</p>;
  }

  return (
    <span className="text-ink-muted text-[14px]">
      {JSON.stringify(rawAnswer)}
    </span>
  );
}

export function LeadAnswers({
  answeredQuestions,
}: {
  answeredQuestions: AnsweredQuestion[];
}) {
  if (answeredQuestions.length === 0) {
    return (
      <p className="text-ink-muted text-[14px]">
        Für diesen Lead liegen keine Check-Antworten vor.
      </p>
    );
  }

  return (
    <dl className="flex flex-col gap-4">
      {answeredQuestions.map((entry) => (
        <div key={entry.question.id}>
          <dt className="text-ink-muted text-[13px] font-medium">
            {entry.question.title}
          </dt>
          <dd className="mt-1">
            <AnswerValue entry={entry} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
