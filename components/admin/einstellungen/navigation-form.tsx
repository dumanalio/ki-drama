"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import { SortableList } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveNavigationContent } from "@/lib/actions/settings";
import { createEmptyNavLink } from "@/lib/navigation";
import type {
  FooterColumn,
  NavigationContent,
  NavLink,
} from "@/lib/navigation";

function NavLinkRow({
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

export function NavigationForm({
  content: initial,
}: {
  content: NavigationContent;
}) {
  const [content, setContent] = React.useState(initial);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, startSaving] = React.useTransition();

  function updateHeaderItem(index: number, patch: Partial<NavLink>) {
    setContent((prev) => ({
      ...prev,
      header: prev.header.map((item, i) =>
        i === index ? { ...item, ...patch } : item
      ),
    }));
  }

  function addHeaderItem() {
    setContent((prev) => ({
      ...prev,
      header: [...prev.header, createEmptyNavLink()],
    }));
  }

  function removeHeaderItem(index: number) {
    setContent((prev) => ({
      ...prev,
      header: prev.header.filter((_, i) => i !== index),
    }));
  }

  function updateFooterColumn(columnIndex: number, patch: Partial<FooterColumn>) {
    setContent((prev) => ({
      ...prev,
      footerColumns: prev.footerColumns.map((column, i) =>
        i === columnIndex ? { ...column, ...patch } : column
      ),
    }));
  }

  function updateFooterLink(
    columnIndex: number,
    linkIndex: number,
    patch: Partial<NavLink>
  ) {
    setContent((prev) => ({
      ...prev,
      footerColumns: prev.footerColumns.map((column, i) =>
        i === columnIndex
          ? {
              ...column,
              links: column.links.map((link, j) =>
                j === linkIndex ? { ...link, ...patch } : link
              ),
            }
          : column
      ),
    }));
  }

  function addFooterLink(columnIndex: number) {
    setContent((prev) => ({
      ...prev,
      footerColumns: prev.footerColumns.map((column, i) =>
        i === columnIndex
          ? { ...column, links: [...column.links, createEmptyNavLink()] }
          : column
      ),
    }));
  }

  function removeFooterLink(columnIndex: number, linkIndex: number) {
    setContent((prev) => ({
      ...prev,
      footerColumns: prev.footerColumns.map((column, i) =>
        i === columnIndex
          ? { ...column, links: column.links.filter((_, j) => j !== linkIndex) }
          : column
      ),
    }));
  }

  function handleSave() {
    setError(null);
    startSaving(async () => {
      const result = await saveNavigationContent(JSON.stringify(content));
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Navigation gespeichert");
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader title="Header-Navigation" />
        <div className="flex flex-col gap-3">
          <SortableList
            items={content.header}
            onReorder={(header) => setContent((prev) => ({ ...prev, header }))}
            renderItem={(item, index) => (
              <NavLinkRow
                link={item}
                onChange={(patch) => updateHeaderItem(index, patch)}
                onRemove={() => removeHeaderItem(index)}
              />
            )}
          />
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={addHeaderItem}
          >
            <Plus className="size-4" aria-hidden="true" />
            Menüpunkt hinzufügen
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Footer" />
        <div className="flex flex-col gap-6">
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Text unter dem Logo
            </span>
            <Textarea
              value={content.footerText}
              onChange={(event) =>
                setContent((prev) => ({ ...prev, footerText: event.target.value }))
              }
              className="min-h-[60px]"
            />
          </label>

          {content.footerColumns.map((column, columnIndex) => (
            <div
              key={column.id}
              className="border-line flex flex-col gap-3 border-t pt-5"
            >
              <label className="flex flex-col gap-1">
                <span className="text-ink-muted text-[12px] font-medium">
                  Spaltenüberschrift
                </span>
                <Input
                  value={column.heading}
                  onChange={(event) =>
                    updateFooterColumn(columnIndex, { heading: event.target.value })
                  }
                  className="max-w-[220px]"
                />
              </label>
              <SortableList
                items={column.links}
                onReorder={(links) => updateFooterColumn(columnIndex, { links })}
                renderItem={(item, linkIndex) => (
                  <NavLinkRow
                    link={item}
                    onChange={(patch) =>
                      updateFooterLink(columnIndex, linkIndex, patch)
                    }
                    onRemove={() => removeFooterLink(columnIndex, linkIndex)}
                  />
                )}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => addFooterLink(columnIndex)}
              >
                <Plus className="size-4" aria-hidden="true" />
                Link hinzufügen
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {error ? (
        <p role="alert" className="text-danger text-[14px]">
          {error}
        </p>
      ) : null}

      <Button
        variant="primary"
        onClick={handleSave}
        loading={isSaving}
        className="self-start"
      >
        Speichern
      </Button>
    </div>
  );
}
