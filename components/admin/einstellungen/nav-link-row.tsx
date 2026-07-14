"use client";

import { X } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { NavLink } from "@/lib/navigation";

export function NavLinkRow({
  link,
  onChange,
  onRemove,
}: {
  link: NavLink;
  onChange: (patch: Partial<NavLink>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border-line bg-surface flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center">
      <Input
        value={link.label}
        onChange={(event) => onChange({ label: event.target.value })}
        placeholder="Beschriftung"
        className="sm:flex-1"
      />
      <Input
        value={link.href}
        onChange={(event) => onChange({ href: event.target.value })}
        placeholder="/ziel oder https://…"
        className="sm:flex-1"
      />
      <div className="flex shrink-0 items-center gap-2">
        <Checkbox
          checked={link.visible}
          onCheckedChange={(visible) => onChange({ visible })}
          label="Sichtbar"
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Menüpunkt entfernen"
          className="text-ink-muted hover:text-danger flex size-9 shrink-0 items-center justify-center rounded-lg"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
