import { notFound } from "next/navigation";

import { ToolForm } from "@/components/admin/landschaft/tool-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { getToolById } from "@/lib/queries/admin-tools";

export default async function AdminToolEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let tool: Awaited<ReturnType<typeof getToolById>> = null;
  let loadError = false;

  try {
    tool = await getToolById(id);
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <>
        <AdminPageHeader title="Tool" />
        <ErrorState
          title="Tool konnte nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      </>
    );
  }

  if (!tool) notFound();

  return <ToolForm tool={tool} />;
}
