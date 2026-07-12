import { BookOpen } from "lucide-react";

import { ChapterCard } from "@/components/site/chapter-card";
import { Section } from "@/components/site/section";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { getPublishedChapters } from "@/lib/queries/content";
import type { Chapter } from "@/types/database";

const LEVEL_LABELS: Record<string, string> = {
  einsteiger: "Einsteiger",
  fortgeschritten: "Fortgeschritten",
};

function groupByLevel(chapters: Chapter[]) {
  const groups = new Map<string, Chapter[]>();
  for (const chapter of chapters) {
    const list = groups.get(chapter.level) ?? [];
    list.push(chapter);
    groups.set(chapter.level, list);
  }
  return groups;
}

export default async function GrundlagenPage() {
  let chapters: Chapter[] = [];
  let loadError = false;

  try {
    chapters = await getPublishedChapters();
  } catch {
    loadError = true;
  }

  return (
    <Section>
      <div className="mb-10 flex flex-col gap-3">
        <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
          Grundlagen
        </span>
        <h1 className="text-ink text-[34px] font-bold tracking-[-0.02em] md:text-[52px]">
          Die Basics, in Ruhe erklärt
        </h1>
        <p className="text-ink-soft max-w-[65ch] text-[17px] leading-relaxed">
          Kurze Kapitel, der Reihe nach. Kein Vorwissen nötig.
        </p>
      </div>

      {loadError ? (
        <ErrorState
          title="Kapitel konnten nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      ) : chapters.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Noch keine Grundlagen-Kapitel veröffentlicht"
          description="Hier entstehen in Kürze die ersten Kapitel."
        />
      ) : (
        <div className="flex flex-col gap-12">
          {Array.from(groupByLevel(chapters)).map(([level, items]) => (
            <div key={level} className="flex flex-col gap-4">
              <h2 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
                {LEVEL_LABELS[level] ?? level}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((chapter) => (
                  <ChapterCard key={chapter.id} chapter={chapter} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
