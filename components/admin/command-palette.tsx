"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Plus, Search, User } from "lucide-react";

import {
  listLeadsForPalette,
  type LeadPaletteEntry,
} from "@/lib/actions/leads";
import { ADMIN_NAV_ITEMS } from "@/lib/admin-nav";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [leads, setLeads] = React.useState<LeadPaletteEntry[] | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isShortcut) return;
      event.preventDefault();
      setOpen((prev) => !prev);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (!open || leads !== null) return;
    listLeadsForPalette()
      .then(setLeads)
      .catch(() => setLeads([]));
  }, [open, leads]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Befehlspalette"
      shouldFilter
      overlayClassName="bg-ink/40 fixed inset-0 z-50"
      contentClassName="fixed top-[15%] left-1/2 z-50 w-full max-w-lg -translate-x-1/2 px-4"
      className="bg-surface shadow-float border-line overflow-hidden rounded-2xl border"
    >
      <div className="border-line flex items-center gap-2 border-b px-4">
        <Search className="text-ink-muted size-4 shrink-0" aria-hidden="true" />
        <Command.Input
          placeholder="Suchen oder springen zu…"
          className="text-ink placeholder:text-ink-muted h-12 w-full bg-transparent text-[15px] outline-none"
        />
      </div>

      <Command.List className="max-h-[60vh] overflow-y-auto p-2">
        <Command.Empty className="text-ink-muted px-3 py-6 text-center text-[14px]">
          Keine Treffer.
        </Command.Empty>

        <Command.Group
          heading="Aktionen"
          className="text-ink-muted [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-[0.04em] [&_[cmdk-group-heading]]:uppercase"
        >
          <Command.Item
            onSelect={() => go("/admin/news/neu")}
            className="text-ink data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] outline-none"
          >
            <Plus className="size-4 shrink-0" aria-hidden="true" />
            Neuer Beitrag
          </Command.Item>
        </Command.Group>

        <Command.Group
          heading="Bereiche"
          className="text-ink-muted mt-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-[0.04em] [&_[cmdk-group-heading]]:uppercase"
        >
          {ADMIN_NAV_ITEMS.map((item) => (
            <Command.Item
              key={item.href}
              onSelect={() => go(item.href)}
              className="text-ink data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] outline-none"
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Command.Item>
          ))}
        </Command.Group>

        {leads && leads.length > 0 ? (
          <Command.Group
            heading="Leads"
            className="text-ink-muted mt-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-[0.04em] [&_[cmdk-group-heading]]:uppercase"
          >
            {leads.map((lead) => (
              <Command.Item
                key={lead.id}
                value={`${lead.name} ${lead.email}`}
                onSelect={() => go(`/admin/leads/${lead.id}`)}
                className="text-ink data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] outline-none"
              >
                <User className="size-4 shrink-0" aria-hidden="true" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate">{lead.name}</span>
                  <span className="text-ink-muted truncate text-[12px]">
                    {lead.email}
                  </span>
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}
      </Command.List>
    </Command.Dialog>
  );
}
