"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { LogOut, Menu, X } from "lucide-react";

import { ADMIN_NAV_ITEMS } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

function isActiveHref(pathname: string | null, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname?.startsWith(href) ?? false;
}

function SidebarHeader() {
  return (
    <div className="px-5 pt-6 pb-4">
      <span className="font-display text-ink text-[18px] font-bold">
        KI-Drama
      </span>
    </div>
  );
}

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string | null;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      <span className="text-ink-muted mb-2 block px-6 text-[11px] font-semibold tracking-[0.06em] uppercase">
        Verwalten
      </span>
      <nav className="flex flex-col gap-0.5 px-3">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = isActiveHref(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] transition-colors duration-[120ms]",
                active
                  ? "text-ink font-semibold"
                  : "text-ink-soft hover:bg-surface-alt hover:text-ink"
              )}
            >
              <Icon
                className={cn(
                  "size-[18px]",
                  active ? "text-accent" : "text-ink-muted"
                )}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function SidebarFooter({
  adminEmail,
  onLogout,
}: {
  adminEmail: string;
  onLogout: () => void;
}) {
  return (
    <div className="border-line border-t px-3 py-4">
      <div className="flex items-center justify-between gap-2 px-2">
        <span className="text-ink-muted truncate text-[13px]">
          {adminEmail}
        </span>
        <button
          type="button"
          onClick={onLogout}
          aria-label="Abmelden"
          className="text-ink-muted hover:text-ink flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-[120ms]"
        >
          <LogOut className="size-[18px]" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <aside className="border-line bg-surface sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r md:flex">
        <SidebarHeader />
        <SidebarNav pathname={pathname} />
        <SidebarFooter adminEmail={adminEmail} onLogout={handleLogout} />
      </aside>

      <div className="border-line bg-surface flex items-center justify-between border-b px-4 py-3 md:hidden">
        <span className="font-display text-ink text-[16px] font-bold">
          KI-Drama
        </span>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Menü öffnen"
          className="text-ink flex size-9 items-center justify-center rounded-lg"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </div>

      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="bg-ink/40 fixed inset-0 z-50 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 md:hidden" />
          <Dialog.Popup
            aria-label="Navigation"
            className="bg-surface fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col transition-transform duration-150 data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full md:hidden"
          >
            <div className="flex items-center justify-between px-5 pt-6 pb-4">
              <span className="font-display text-ink text-[18px] font-bold">
                KI-Drama
              </span>
              <Dialog.Close
                aria-label="Menü schließen"
                className="text-ink-muted hover:text-ink flex size-8 items-center justify-center rounded-lg transition-colors duration-[120ms]"
              >
                <X className="size-5" aria-hidden="true" />
              </Dialog.Close>
            </div>
            <SidebarNav
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
            <SidebarFooter adminEmail={adminEmail} onLogout={handleLogout} />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
