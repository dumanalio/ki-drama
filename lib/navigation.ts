export interface NavLink {
  id: string;
  label: string;
  href: string;
  visible: boolean;
}

export interface FooterColumn {
  id: string;
  heading: string;
  links: NavLink[];
}

export interface NavigationContent {
  header: NavLink[];
  footerText: string;
  footerColumns: FooterColumn[];
  /** null = automatisch "© {aktuelles Jahr} KI-Drama" (bleibt immer aktuell, bis explizit überschrieben). */
  copyrightText: string | null;
  legalLinks: NavLink[];
}

export const DEFAULT_NAVIGATION: NavigationContent = {
  header: [
    { id: "grundlagen", label: "Grundlagen", href: "/grundlagen", visible: true },
    { id: "landschaft", label: "Landschaft", href: "/landschaft", visible: true },
    { id: "news", label: "News", href: "/news", visible: true },
    { id: "ueber-mich", label: "Über mich", href: "/ueber-mich", visible: true },
  ],
  footerText: "Die Aufregung ist groß, die Erklärung fehlt.",
  footerColumns: [
    {
      id: "wissen",
      heading: "Wissen",
      links: [
        { id: "f-grundlagen", label: "Grundlagen", href: "/grundlagen", visible: true },
        { id: "f-landschaft", label: "Landschaft", href: "/landschaft", visible: true },
        { id: "f-news", label: "News", href: "/news", visible: true },
        { id: "f-check", label: "Der Check", href: "/check", visible: true },
      ],
    },
    {
      id: "kontakt",
      heading: "Kontakt",
      links: [
        { id: "f-ueber-mich", label: "Über mich", href: "/ueber-mich", visible: true },
        { id: "f-kontakt", label: "Kontakt", href: "/kontakt", visible: true },
      ],
    },
  ],
  copyrightText: null,
  legalLinks: [
    { id: "impressum", label: "Impressum", href: "/impressum", visible: true },
    { id: "datenschutz", label: "Datenschutz", href: "/datenschutz", visible: true },
  ],
};

export function createEmptyNavLink(): NavLink {
  return { id: crypto.randomUUID(), label: "", href: "", visible: true };
}

export function createEmptyFooterColumn(): FooterColumn {
  return { id: crypto.randomUUID(), heading: "", links: [] };
}

/** Ergänzt fehlende Felder (z. B. nach einer späteren Erweiterung der Struktur) um die Defaults. */
export function normalizeNavigation(
  stored: Partial<NavigationContent> | null | undefined
): NavigationContent {
  if (!stored) return DEFAULT_NAVIGATION;
  return {
    header: Array.isArray(stored.header) ? stored.header : DEFAULT_NAVIGATION.header,
    footerText:
      typeof stored.footerText === "string"
        ? stored.footerText
        : DEFAULT_NAVIGATION.footerText,
    footerColumns: Array.isArray(stored.footerColumns)
      ? stored.footerColumns
      : DEFAULT_NAVIGATION.footerColumns,
    copyrightText:
      typeof stored.copyrightText === "string" ? stored.copyrightText : null,
    legalLinks: Array.isArray(stored.legalLinks)
      ? stored.legalLinks
      : DEFAULT_NAVIGATION.legalLinks,
  };
}
