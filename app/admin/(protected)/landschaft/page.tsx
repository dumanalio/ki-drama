import Link from "next/link";
import { Layers, Plus } from "lucide-react";

import { ToolList } from "@/components/admin/landschaft/tool-list";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { getToolsForList } from "@/lib/queries/admin-tools";

export default async function AdminLandschaftPage() {
  let tools: Awaited<ReturnType<typeof getToolsForList>> = [];
  let loadError = false;

  try {
    tools = await getToolsForList();
  } catch {
    loadError = true;
  }

  return (
    <>
      <AdminPageHeader
        title="Landschaft"
        action={
          <Link
            href="/admin/landschaft/neu"
            className={buttonVariants({ variant: "primary" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            Neues Tool
          </Link>
        }
      />

      {loadError ? (
        <ErrorState
          title="Tools konnten nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      ) : tools.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Noch keine Tools"
          description="Lege das erste Tool für die Landschaft-Übersicht an."
        />
      ) : (
        <ToolList tools={tools} />
      )}
    </>
  );
}
