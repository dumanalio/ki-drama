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
  getLandingPageContent,
  getNavigationContent,
} from "@/lib/queries/admin-settings";

export default async function AdminStartseitePage() {
  let landingPageContent: Awaited<
    ReturnType<typeof getLandingPageContent>
  > | null = null;
  let navigationContent: Awaited<
    ReturnType<typeof getNavigationContent>
  > | null = null;
  let loadError = false;

  try {
    [landingPageContent, navigationContent] = await Promise.all([
      getLandingPageContent(),
      getNavigationContent(),
    ]);
  } catch {
    loadError = true;
  }

  if (loadError || !landingPageContent || !navigationContent) {
    return (
      <>
        <AdminPageHeader title="Startseite" />
        <ErrorState
          title="Startseite konnte nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title="Startseite" />

      <Tabs defaultValue="inhalt">
        <TabsList>
          <TabsTab value="inhalt">Inhalt</TabsTab>
          <TabsTab value="navigation">Navigation</TabsTab>
          <TabsIndicator />
        </TabsList>

        <TabsPanel value="inhalt">
          <LandingPageForm content={landingPageContent} />
        </TabsPanel>

        <TabsPanel value="navigation">
          <NavigationForm content={navigationContent} />
        </TabsPanel>
      </Tabs>
    </>
  );
}
