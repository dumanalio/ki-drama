import { GeneralSettingsForm } from "@/components/admin/einstellungen/general-settings-form";
import { LandingPageForm } from "@/components/admin/einstellungen/landing-page-form";
import { NavigationForm } from "@/components/admin/einstellungen/navigation-form";
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
  getNavigationContent,
} from "@/lib/queries/admin-settings";

export default async function AdminEinstellungenPage() {
  let generalSettings: Awaited<ReturnType<typeof getGeneralSettings>> | null =
    null;
  let landingPageContent: Awaited<
    ReturnType<typeof getLandingPageContent>
  > | null = null;
  let navigationContent: Awaited<
    ReturnType<typeof getNavigationContent>
  > | null = null;
  let loadError = false;

  try {
    [generalSettings, landingPageContent, navigationContent] =
      await Promise.all([
        getGeneralSettings(),
        getLandingPageContent(),
        getNavigationContent(),
      ]);
  } catch {
    loadError = true;
  }

  if (
    loadError ||
    !generalSettings ||
    !landingPageContent ||
    !navigationContent
  ) {
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
          <TabsTab value="navigation">Navigation</TabsTab>
          <TabsTab value="allgemein">Allgemein</TabsTab>
          <TabsIndicator />
        </TabsList>

        <TabsPanel value="startseite">
          <LandingPageForm content={landingPageContent} />
        </TabsPanel>

        <TabsPanel value="navigation">
          <NavigationForm content={navigationContent} />
        </TabsPanel>

        <TabsPanel value="allgemein">
          <GeneralSettingsForm settings={generalSettings} />
        </TabsPanel>
      </Tabs>
    </>
  );
}
