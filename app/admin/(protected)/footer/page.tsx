import { FooterForm } from "@/components/admin/footer/footer-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ErrorState } from "@/components/ui/error-state";
import {
  getGeneralSettings,
  getNavigationContent,
} from "@/lib/queries/admin-settings";

export default async function AdminFooterPage() {
  let generalSettings: Awaited<ReturnType<typeof getGeneralSettings>> | null =
    null;
  let navigationContent: Awaited<
    ReturnType<typeof getNavigationContent>
  > | null = null;
  let loadError = false;

  try {
    [generalSettings, navigationContent] = await Promise.all([
      getGeneralSettings(),
      getNavigationContent(),
    ]);
  } catch {
    loadError = true;
  }

  if (loadError || !generalSettings || !navigationContent) {
    return (
      <>
        <AdminPageHeader title="Footer" />
        <ErrorState
          title="Footer konnte nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title="Footer" />
      <FooterForm
        logoUrl={generalSettings.footerLogoUrl}
        logoAlt={generalSettings.footerLogoAlt}
        logoHeight={generalSettings.footerLogoHeight}
        footerText={navigationContent.footerText}
        footerColumns={navigationContent.footerColumns}
        copyrightText={navigationContent.copyrightText}
        legalLinks={navigationContent.legalLinks}
      />
    </>
  );
}
