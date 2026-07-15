import { GeneralSettingsForm } from "@/components/admin/einstellungen/general-settings-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { getGeneralSettings } from "@/lib/queries/admin-settings";

export default async function AdminEinstellungenPage() {
  let generalSettings: Awaited<ReturnType<typeof getGeneralSettings>> | null =
    null;
  let loadError = false;

  try {
    generalSettings = await getGeneralSettings();
  } catch {
    loadError = true;
  }

  if (loadError || !generalSettings) {
    return (
      <>
        <AdminPageHeader title="Einstellungen" />
        <ErrorState
          title="Einstellungen konnten nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title="Einstellungen" />
      <GeneralSettingsForm settings={generalSettings} />
    </>
  );
}
