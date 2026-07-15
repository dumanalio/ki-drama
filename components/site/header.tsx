"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resolveButtonStyle } from "@/lib/button-color";
import { cn } from "@/lib/utils";
import type { LandingButtonColor, LandingTextColor } from "@/lib/landing-content";
import { DEFAULT_NAVIGATION, type NavLink } from "@/lib/navigation";

function SiteLogo({
  logoUrl,
  logoAlt,
  logoHeight,
  className,
}: {
  logoUrl: string | null;
  logoAlt: string | null;
  logoHeight: number;
  className?: string;
}) {
  if (logoUrl) {
    // Bewusst next/image umgangen: das Logo hat ein unbekanntes, variables
    // Seitenverhältnis. next/image verlangt feste width/height-Attribute,
    // die der Browser (unabhängig vom tatsächlichen Bildinhalt) zur
    // Berechnung von "width: auto" heranzieht -- ein geratener Wert hier
    // führte zu sichtbarem, ungewolltem Leerraum links/rechts neben dem
    // Logo (object-fit: contain zentrierte das Bild in der falsch
    // proportionierten Box). Ein normales <img> mit nur der Höhe fest
    // gesetzt übernimmt stattdessen einfach das echte Seitenverhältnis.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={logoAlt ?? "KI-Drama"}
        style={{ height: logoHeight, width: "auto" }}
        className={className}
      />
    );
  }
  return (
    <span className={cn("font-display text-ink text-[18px] font-bold tracking-[-0.01em]", className)}>
      KI-Drama
    </span>
  );
}

export function Header({
  buttonColor = "accent",
  buttonCustomColor = null,
  buttonTextColor = "auto",
  buttonTextCustomColor = null,
  logoUrl = null,
  logoAlt = null,
  logoHeight = 32,
  navItems = DEFAULT_NAVIGATION.header,
}: {
  buttonColor?: LandingButtonColor;
  buttonCustomColor?: string | null;
  buttonTextColor?: LandingTextColor;
  buttonTextCustomColor?: string | null;
  logoUrl?: string | null;
  logoAlt?: string | null;
  logoHeight?: number;
  navItems?: NavLink[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const buttonStyle = resolveButtonStyle(
    buttonColor,
    buttonCustomColor,
    buttonTextColor,
    buttonTextCustomColor
  );
  const visibleNavItems = navItems.filter((item) => item.visible);

  return (
    <header className="border-line bg-surface sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link href="/" aria-label="Zur Startseite">
          <SiteLogo logoUrl={logoUrl} logoAlt={logoAlt} logoHeight={logoHeight} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {visibleNavItems.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-[15px] transition-colors duration-[120ms]",
                  active
                    ? "text-ink font-semibold"
                    : "text-ink-soft hover:bg-surface-alt hover:text-ink"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Button
            variant={buttonStyle.variant}
            style={buttonStyle.style}
            size="sm"
            render={<Link href="/check" />}
          >
            Check starten
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-ink flex size-10 items-center justify-center rounded-lg md:hidden"
          aria-label="Menü öffnen"
        >
          <Menu className="size-6" aria-hidden="true" />
        </button>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="bg-ink/40 fixed inset-0 z-50 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <Dialog.Popup
            aria-label="Menü"
            className="bg-surface fixed inset-0 z-50 flex flex-col p-6 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
          >
            <div className="flex items-center justify-between">
              <SiteLogo logoUrl={logoUrl} logoAlt={logoAlt} logoHeight={logoHeight} />
              <Dialog.Close
                aria-label="Menü schließen"
                className="text-ink flex size-10 items-center justify-center rounded-lg"
              >
                <X className="size-6" aria-hidden="true" />
              </Dialog.Close>
            </div>
            <nav className="mt-10 flex flex-col gap-6">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-ink text-[22px] font-semibold"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto">
              <Button
                variant={buttonStyle.variant}
                style={buttonStyle.style}
                size="lg"
                className="w-full"
                render={<Link href="/check" onClick={() => setOpen(false)} />}
              >
                Check starten
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
