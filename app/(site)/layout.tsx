import type { ReactNode } from "react";

import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import {
  getGeneralSettings,
  getNavigationContent,
} from "@/lib/queries/admin-settings";

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Ein Fehlschlag hier soll die Seite nicht blockieren -- Header/Footer
  // fallen einfach auf ihre eingebauten Defaults zurück.
  const [settings, navigation] = await Promise.all([
    getGeneralSettings().catch(() => null),
    getNavigationContent().catch(() => null),
  ]);

  return (
    <>
      <Header
        buttonColor={settings?.headerButtonColor}
        buttonCustomColor={settings?.headerButtonCustomColor}
        logoUrl={settings?.headerLogoUrl}
        logoAlt={settings?.headerLogoAlt}
        logoHeight={settings?.headerLogoHeight}
        navItems={navigation?.header}
      />
      <main className="flex-1">{children}</main>
      <Footer
        logoUrl={settings?.footerLogoUrl}
        logoAlt={settings?.footerLogoAlt}
        logoHeight={settings?.footerLogoHeight}
        footerText={navigation?.footerText}
        footerColumns={navigation?.footerColumns}
      />
    </>
  );
}
