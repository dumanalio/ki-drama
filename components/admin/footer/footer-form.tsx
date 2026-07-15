"use client";

import * as React from "react";
import { FilePlus, Plus } from "lucide-react";
import { toast } from "sonner";

import { NavLinkRow } from "@/components/admin/einstellungen/nav-link-row";
import { LogoField } from "@/components/admin/einstellungen/logo-field";
import { SortableList } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createDraftPageForLink } from "@/lib/actions/pages";
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
  copyrightText: initialCopyrightText,
  legalLinks: initialLegalLinks,
}: {
  logoUrl: GeneralSettings["footerLogoUrl"];
  logoAlt: GeneralSettings["footerLogoAlt"];
  logoHeight: GeneralSettings["footerLogoHeight"];
  footerText: string;
  footerColumns: FooterColumn[];
  copyrightText: string | null;
  legalLinks: NavLink[];
}) {
  const [logoUrl, setLogoUrl] = React.useState(initialLogoUrl);
  const [logoAlt, setLogoAlt] = React.useState(initialLogoAlt);
  const [logoHeight, setLogoHeight] = React.useState(initialLogoHeight);
  const [footerText, setFooterText] = React.useState(initialFooterText);
  const [footerColumns, setFooterColumns] = React.useState(initialFooterColumns);
  const [copyrightText, setCopyrightText] = React.useState(initialCopyrightText);
  const [legalLinks, setLegalLinks] = React.useState(initialLegalLinks);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, startSaving] = React.useTransition();

  function updateLegalLink(index: number, patch: Partial<NavLink>) {
    setLegalLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, ...patch } : link))
    );
  }

  function addLegalLink() {
    setLegalLinks((prev) => [...prev, createEmptyNavLink()]);
  }

  function removeLegalLink(index: number) {
    setLegalLinks((prev) => prev.filter((_, i) => i !== index));
  }

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

  async function addPageLink(columnIndex: number) {
    const result = await createDraftPageForLink();
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setFooterColumns((prev) =>
      prev.map((column, i) =>
        i === columnIndex
          ? {
              ...column,
              links: [
                ...column.links,
                {
                  id: crypto.randomUUID(),
                  label: "Neue Seite",
                  href: `/${result.slug}`,
                  visible: true,
                },
              ],
            }
          : column
      )
    );
    toast.success(
      "Seite angelegt — bearbeite Titel und Inhalt im neuen Tab, dann hier speichern, damit der Link erscheint."
    );
    window.open(`/admin/seiten/${result.id}`, "_blank");
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
          copyrightText,
          legalLinks,
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
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => addLink(columnIndex)}
              >
                <Plus className="size-4" aria-hidden="true" />
                Link hinzufügen
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => void addPageLink(columnIndex)}
              >
                <FilePlus className="size-4" aria-hidden="true" />
                Neue Seite verlinken
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <Card>
        <CardHeader title="Copyright-Zeile" />
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">
              Copyright-Text
            </span>
            <Input
              value={copyrightText ?? ""}
              onChange={(event) =>
                setCopyrightText(
                  event.target.value.trim().length === 0
                    ? null
                    : event.target.value
                )
              }
              placeholder={`© ${new Date().getFullYear()} KI-Drama`}
            />
            <span className="text-ink-muted text-[12px]">
              Leer lassen für den automatischen Text mit immer aktuellem
              Jahr, z. B. {`© ${new Date().getFullYear()} KI-Drama`}.
            </span>
          </label>

          <div className="flex flex-col gap-3">
            <span className="text-ink-muted text-[12px] font-medium">
              Links rechts (z. B. Impressum, Datenschutz)
            </span>
            <SortableList
              items={legalLinks}
              onReorder={setLegalLinks}
              renderItem={(item, index) => (
                <NavLinkRow
                  link={item}
                  onChange={(patch) => updateLegalLink(index, patch)}
                  onRemove={() => removeLegalLink(index)}
                />
              )}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={addLegalLink}
            >
              <Plus className="size-4" aria-hidden="true" />
              Link hinzufügen
            </Button>
          </div>
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
