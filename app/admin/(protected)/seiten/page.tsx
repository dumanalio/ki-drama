import Link from "next/link";
import { FileText, Plus } from "lucide-react";

import { PageList } from "@/components/admin/pages/page-list";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { getPagesForList } from "@/lib/queries/admin-pages";

export default async function AdminPagesPage() {
  let pages: Awaited<ReturnType<typeof getPagesForList>> = [];
  let loadError = false;

  try {
    pages = await getPagesForList();
  } catch {
    loadError = true;
  }

  return (
    <>
      <AdminPageHeader
        title="Seiten"
        action={
          <Link
            href="/admin/seiten/neu"
            className={buttonVariants({ variant: "primary" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            Neue Seite
          </Link>
        }
      />

      {loadError ? (
        <ErrorState
          title="Seiten konnten nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      ) : pages.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Noch keine eigenen Seiten"
          description="Lege eine Seite an, um sie dann in der Navigation zu verlinken."
        />
      ) : (
        <PageList pages={pages} />
      )}
    </>
  );
}
