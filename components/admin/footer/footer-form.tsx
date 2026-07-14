"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { NavLinkRow } from "@/components/admin/einstellungen/nav-link-row";
import { LogoField } from "@/components/admin/einstellungen/logo-field";
import { SortableList } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveFooterSettings } from "@/lib/actions/settings";
import { createEmptyNavLink } from "@/lib/navigation";
import type { FooterColumn, NavLink } from "@/lib/navigation";
import type { GeneralSettings } from "@/lib/queries/admin-settings";

export function FooterForm({
  logoUrl: initialLogoUrl,
  logoAlt: initialLogoAlt,
  logoHeight: initialLogoHeight,
  footerText: initialFooterText,
  footerColumns: initialFooterColumns,
}: {
  logoUrl: GeneralSettings["footerLogoUrl"];
  logoAlt: GeneralSettings["footerLogoAlt"];
  logoHeight: GeneralSettings["footerLogoHeight"];
  footerText: string;
  footerColumns: FooterColumn[];
}) {
  const [logoUrl, setLogoUrl] = React.useState(initialLogoUrl);
  const [logoAlt, setLogoAlt] = React.useState(initialLogoAlt);
  const [logoHeight, setLogoHeight] = React.useState(initialLogoHeight);
  const [footerText, setFooterText] = React.useState(initialFooterText);
  const [footerColumns, setFooterColumns] = React.useState(initialFooterColumns);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, startSaving] = React.useTransition();

  function updateColumn(columnIndex: number, patch: Partial<FooterColumn>) {
    setFooterColumns((prev) =>
      prev.map((column, i) => (i === columnIndex ? { ...column, ...patch } : column))
    );
  }

  function updateLink(columnIndex: number, linkIndex: number, patch: Partial<NavLink>) {
    setFooterColumns((prev) =>
      prev.map((column, i) =>
        i === columnIndex
          ? {
              ...column,
              links: column.links.map((link, j) =>
                j === linkIndex ? { ...link, ...patch } : link
              ),
            }
          : column
      )
    );
  }

  function addLink(columnIndex: number) {
    setFooterColumns((prev) =>
      prev.map((column, i) =>
        i === columnIndex
          ? { ...column, links: [...column.links, createEmptyNavLink()] }
          : column
      )
    );
  }

  function removeLink(columnIndex: number, linkIndex: number) {
    setFooterColumns((prev) =>
      prev.map((column, i) =>
        i === columnIndex
          ? { ...column, links: column.links.filter((_, j) => j !== linkIndex) }
          : column
      )
    );
  }

  function handleSave() {
    setError(null);
    startSaving(async () => {
      const result = await saveFooterSettings(
        JSON.stringify({
          footerLogoUrl: logoUrl,
          footerLogoAlt: logoAlt,
          footerLogoHeight: logoHeight,
          footerText,
          footerColumns,
        })
      );
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Footer gespeichert");
    });
  }

  return (
    <div className="flex max-w-[720px] flex-col gap-6">
      <Card>
        <CardHeader title="Logo & Text" />
        <div className="flex flex-col gap-5">
          <LogoField
            label='Logo (ersetzt den Schriftzug "KI-Drama" unten links)'
            imageUrl={logoUrl}
            imageAlt={logoAlt}
            height={logoHeight}
            onSelect={(url, alt) => {
              setLogoUrl(url);
              setLogoAlt(alt);
            }}
            onAltChange={setLogoAlt}
            onRemove={() => {
              setLogoUrl(null);
              setLogoAlt(null);
            }}
            onHeightChange={setLogoHeight}
          />

          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Text unter dem Logo
            </span>
            <Textarea
              value={footerText}
              onChange={(event) => setFooterText(event.target.value)}
              className="min-h-[60px]"
            />
          </label>
        </div>
      </Card>

      {footerColumns.map((column, columnIndex) => (
        <Card key={column.id}>
          <CardHeader title={column.heading || `Spalte ${columnIndex + 1}`} />
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-ink-muted text-[12px] font-medium">
                Spaltenüberschrift
              </span>
              <Input
                value={column.heading}
                onChange={(event) =>
                  updateColumn(columnIndex, { heading: event.target.value })
                }
                className="max-w-[220px]"
              />
            </label>
            <SortableList
              items={column.links}
              onReorder={(links) => updateColumn(columnIndex, { links })}
              renderItem={(item, linkIndex) => (
                <NavLinkRow
                  link={item}
                  onChange={(patch) => updateLink(columnIndex, linkIndex, patch)}
                  onRemove={() => removeLink(columnIndex, linkIndex)}
                />
              )}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => addLink(columnIndex)}
            >
              <Plus className="size-4" aria-hidden="true" />
              Link hinzufügen
            </Button>
          </div>
        </Card>
      ))}

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
