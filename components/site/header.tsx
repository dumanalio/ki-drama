"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/grundlagen", label: "Grundlagen" },
  { href: "/landschaft", label: "Landschaft" },
  { href: "/news", label: "News" },
  { href: "/ueber-mich", label: "Über mich" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="border-line bg-surface sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-ink text-[18px] font-bold tracking-[-0.01em]"
        >
          KI-Drama
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
          <Button variant="accent" size="sm" render={<Link href="/check" />}>
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
              <span className="font-display text-ink text-[18px] font-bold">
                KI-Drama
              </span>
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
                variant="accent"
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
