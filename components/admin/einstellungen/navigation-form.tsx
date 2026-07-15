"use client";

import * as React from "react";
import { FilePlus, Plus } from "lucide-react";
import { toast } from "sonner";

import { NavLinkRow } from "@/components/admin/einstellungen/nav-link-row";
import { SortableList } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { createDraftPageForLink } from "@/lib/actions/pages";
import { saveNavigationContent } from "@/lib/actions/settings";
import { createEmptyNavLink } from "@/lib/navigation";
import type { NavigationContent, NavLink } from "@/lib/navigation";

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

  async function addPageLink() {
    const result = await createDraftPageForLink();
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setContent((prev) => ({
      ...prev,
      header: [
        ...prev.header,
        { id: crypto.randomUUID(), label: "Neue Seite", href: `/${result.slug}`, visible: true },
      ],
    }));
    toast.success(
      "Seite angelegt — bearbeite Titel und Inhalt im neuen Tab, dann hier speichern, damit der Link erscheint."
    );
    window.open(`/admin/seiten/${result.id}`, "_blank");
  }

  function handleSave() {
    setError(null);
    startSaving(async () => {
      // footerText/footerColumns werden hier nicht bearbeitet (siehe
      // /admin/footer), müssen aber unverändert mitgeschickt werden -- die
      // Server Action validiert und speichert den gesamten Navigations-Datensatz.
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
    <div className="flex max-w-[720px] flex-col gap-6">
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
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={addHeaderItem}
            >
              <Plus className="size-4" aria-hidden="true" />
              Menüpunkt hinzufügen
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => void addPageLink()}
            >
              <FilePlus className="size-4" aria-hidden="true" />
              Neue Seite verlinken
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
