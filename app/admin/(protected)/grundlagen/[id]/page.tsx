import { notFound } from "next/navigation";

import { ChapterEditor } from "@/components/admin/grundlagen/chapter-editor";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { getChapterById } from "@/lib/queries/admin-chapters";

export default async function AdminChapterEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let chapter: Awaited<ReturnType<typeof getChapterById>> = null;
  let loadError = false;

  try {
    chapter = await getChapterById(id);
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <>
        <AdminPageHeader title="Kapitel" />
        <ErrorState
          title="Kapitel konnte nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      </>
    );
  }

  if (!chapter) notFound();

  return <ChapterEditor chapter={chapter} />;
}
