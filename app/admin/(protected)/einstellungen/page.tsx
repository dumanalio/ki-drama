import { GeneralSettingsForm } from "@/components/admin/einstellungen/general-settings-form";
import { LandingPageForm } from "@/components/admin/einstellungen/landing-page-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ErrorState } from "@/components/ui/error-state";
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@/components/ui/tabs";
import {
  getGeneralSettings,
  getLandingPageContent,
} from "@/lib/queries/admin-settings";

export default async function AdminEinstellungenPage() {
  let generalSettings: Awaited<ReturnType<typeof getGeneralSettings>> | null =
    null;
  let landingPageContent: Awaited<
    ReturnType<typeof getLandingPageContent>
  > | null = null;
  let loadError = false;

  try {
    [generalSettings, landingPageContent] = await Promise.all([
      getGeneralSettings(),
      getLandingPageContent(),
    ]);
  } catch {
    loadError = true;
  }

  if (loadError || !generalSettings || !landingPageContent) {
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

      <Tabs defaultValue="startseite">
        <TabsList>
          <TabsTab value="startseite">Startseite</TabsTab>
          <TabsTab value="allgemein">Allgemein</TabsTab>
          <TabsIndicator />
        </TabsList>

        <TabsPanel value="startseite">
          <LandingPageForm content={landingPageContent} />
        </TabsPanel>

        <TabsPanel value="allgemein">
          <GeneralSettingsForm settings={generalSettings} />
        </TabsPanel>
      </Tabs>
    </>
  );
}
