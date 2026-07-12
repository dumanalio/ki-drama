import { createDraftChapter } from "@/lib/actions/chapters";

export default async function NewChapterPage() {
  await createDraftChapter();
  return null;
}
