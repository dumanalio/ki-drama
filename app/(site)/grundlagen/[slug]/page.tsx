import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Section } from "@/components/site/section";
import { ErrorState } from "@/components/ui/error-state";
import { estimateReadingMinutes, TiptapRender } from "@/lib/tiptap-render";
import { getChapterBySlug, getPublishedChapters } from "@/lib/queries/content";
import type { Chapter } from "@/types/database";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let chapter: Chapter | null = null;
  let chapters: Chapter[] = [];
  let loadError = false;

  try {
    chapter = await getChapterBySlug(slug);
    chapters = await getPublishedChapters();
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <Section>
        <ErrorState
          title="Kapitel konnte nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      </Section>
    );
  }

  if (!chapter) notFound();

  const currentIndex = chapters.findIndex((item) => item.id === chapter.id);
  const nextChapter =
    currentIndex >= 0 ? chapters[currentIndex + 1] : undefined;

  return (
    <Section>
      <article className="mx-auto flex max-w-[720px] flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-ink text-[34px] font-bold tracking-[-0.02em] md:text-[52px]">
            {chapter.title}
          </h1>
          <span className="text-ink-muted text-[14px]">
            {estimateReadingMinutes(chapter.body)} Min. Lesezeit
          </span>
        </div>

        <TiptapRender doc={chapter.body} />

        {nextChapter ? (
          <Link
            href={`/grundlagen/${nextChapter.slug}`}
            className="group border-line bg-surface shadow-card hover:border-line-strong mt-10 flex items-center justify-between rounded-xl border p-5 transition-colors duration-[120ms]"
          >
            <div className="flex flex-col gap-1">
              <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
                Nächstes Kapitel
              </span>
              <span className="text-ink group-hover:text-accent text-[18px] font-semibold">
                {nextChapter.title}
              </span>
            </div>
            <ArrowRight className="text-accent size-5" aria-hidden="true" />
          </Link>
        ) : null}
      </article>
    </Section>
  );
}
