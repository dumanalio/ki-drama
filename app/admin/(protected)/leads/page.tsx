import { Users } from "lucide-react";

import { LeadsTable } from "@/components/admin/leads-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { getLeadsForTable } from "@/lib/queries/admin-leads";

export default async function AdminLeadsPage() {
  let leads: Awaited<ReturnType<typeof getLeadsForTable>> = [];
  let loadError = false;

  try {
    leads = await getLeadsForTable();
  } catch {
    loadError = true;
  }

  return (
    <>
      <AdminPageHeader title="Leads" />

      {loadError ? (
        <ErrorState
          title="Leads konnten nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      ) : leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Noch keine Leads"
          description="Sobald jemand den Check abschließt, erscheint er hier."
        />
      ) : (
        <LeadsTable data={leads} />
      )}
    </>
  );
}
