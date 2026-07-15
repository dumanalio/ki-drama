import { notFound } from "next/navigation";

import { PageEditor } from "@/components/admin/pages/page-editor";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { getPageById } from "@/lib/queries/admin-pages";

export default async function AdminPageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let page: Awaited<ReturnType<typeof getPageById>> = null;
  let loadError = false;

  try {
    page = await getPageById(id);
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <>
        <AdminPageHeader title="Seite" />
        <ErrorState
          title="Seite konnte nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      </>
    );
  }

  if (!page) notFound();

  return <PageEditor page={page} />;
}
