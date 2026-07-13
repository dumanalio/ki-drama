import type { ReactNode } from "react";

import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { getGeneralSettings } from "@/lib/queries/admin-settings";

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Ein Fehlschlag hier soll die Seite nicht blockieren -- Header/Footer
  // fallen einfach auf ihre eingebauten Defaults zurück.
  const settings = await getGeneralSettings().catch(() => null);

  return (
    <>
      <Header
        buttonColor={settings?.headerButtonColor}
        buttonCustomColor={settings?.headerButtonCustomColor}
        logoUrl={settings?.logoUrl}
        logoAlt={settings?.logoAlt}
      />
      <main className="flex-1">{children}</main>
      <Footer logoUrl={settings?.logoUrl} logoAlt={settings?.logoAlt} />
    </>
  );
}
