import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";

import { ChapterList } from "@/components/admin/grundlagen/chapter-list";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { getChaptersForList } from "@/lib/queries/admin-chapters";

export default async function AdminGrundlagenPage() {
  let chapters: Awaited<ReturnType<typeof getChaptersForList>> = [];
  let loadError = false;

  try {
    chapters = await getChaptersForList();
  } catch {
    loadError = true;
  }

  return (
    <>
      <AdminPageHeader
        title="Grundlagen"
        action={
          <Link
            href="/admin/grundlagen/neu"
            className={buttonVariants({ variant: "primary" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            Neues Kapitel
          </Link>
        }
      />

      {loadError ? (
        <ErrorState
          title="Kapitel konnten nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      ) : chapters.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Noch keine Kapitel"
          description="Lege das erste Grundlagen-Kapitel an."
        />
      ) : (
        <ChapterList chapters={chapters} />
      )}
    </>
  );
}
