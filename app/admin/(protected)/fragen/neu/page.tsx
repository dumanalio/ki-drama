import { createDraftQuestion } from "@/lib/actions/questions";

export default async function NewQuestionPage() {
  await createDraftQuestion();
  return null;
}
