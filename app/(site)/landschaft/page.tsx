import { Layers } from "lucide-react";

import { LandschaftFilter } from "@/components/site/landschaft-filter";
import { Section } from "@/components/site/section";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { getPublishedTools } from "@/lib/queries/content";
import type { Tool } from "@/types/database";

export default async function LandschaftPage() {
  let tools: Tool[] = [];
  let loadError = false;

  try {
    tools = await getPublishedTools();
  } catch {
    loadError = true;
  }

  return (
    <Section>
      <div className="mb-10 flex flex-col gap-3">
        <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
          Landschaft
        </span>
        <h1 className="text-ink text-[34px] font-bold tracking-[-0.02em] md:text-[52px]">
          Was es aktuell gibt
        </h1>
        <p className="text-ink-soft max-w-[65ch] text-[17px] leading-relaxed">
          Eine neutrale Übersicht der aktuellen KI-Werkzeuge. Ohne Empfehlungen,
          ohne Bewertungen.
        </p>
      </div>

      {loadError ? (
        <ErrorState
          title="Tools konnten nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      ) : tools.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Noch keine Tools gelistet"
          description="Die Tool-Übersicht wird gerade aufgebaut."
        />
      ) : (
        <LandschaftFilter tools={tools} />
      )}
    </Section>
  );
}
