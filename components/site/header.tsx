"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resolveButtonStyle } from "@/lib/button-color";
import { cn } from "@/lib/utils";
import type { LandingButtonColor } from "@/lib/landing-content";

const NAV_ITEMS = [
  { href: "/grundlagen", label: "Grundlagen" },
  { href: "/landschaft", label: "Landschaft" },
  { href: "/news", label: "News" },
  { href: "/ueber-mich", label: "Über mich" },
];

function SiteLogo({
  logoUrl,
  logoAlt,
  className,
}: {
  logoUrl: string | null;
  logoAlt: string | null;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={logoAlt ?? "KI-Drama"}
        width={140}
        height={32}
        className={cn("h-8 w-auto object-contain", className)}
        priority
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
  logoUrl = null,
  logoAlt = null,
}: {
  buttonColor?: LandingButtonColor;
  buttonCustomColor?: string | null;
  logoUrl?: string | null;
  logoAlt?: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const buttonStyle = resolveButtonStyle(buttonColor, buttonCustomColor);

  return (
    <header className="border-line bg-surface sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link href="/" aria-label="Zur Startseite">
          <SiteLogo logoUrl={logoUrl} logoAlt={logoAlt} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[15px] transition-colors duration-[120ms]",
                  active
                    ? "text-ink font-semibold"
                    : "text-ink-soft hover:text-ink"
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
              <SiteLogo logoUrl={logoUrl} logoAlt={logoAlt} />
              <Dialog.Close
                aria-label="Menü schließen"
                className="text-ink flex size-10 items-center justify-center rounded-lg"
              >
                <X className="size-6" aria-hidden="true" />
              </Dialog.Close>
            </div>
            <nav className="mt-10 flex flex-col gap-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
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
