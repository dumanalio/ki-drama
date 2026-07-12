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
          <h1 className="text-[34px] font-bold tracking-[-0.02em] text-ink md:text-[52px]">
            {chapter.title}
          </h1>
          <span className="text-[14px] text-ink-muted">
            {estimateReadingMinutes(chapter.body)} Min. Lesezeit
          </span>
        </div>

        <TiptapRender doc={chapter.body} />

        {nextChapter ? (
          <Link
            href={`/grundlagen/${nextChapter.slug}`}
            className="group mt-10 flex items-center justify-between rounded-xl border border-line bg-surface p-5 shadow-card transition-colors duration-[120ms] hover:border-line-strong"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-semibold tracking-[0.06em] text-ink-muted uppercase">
                Nächstes Kapitel
              </span>
              <span className="text-[18px] font-semibold text-ink group-hover:text-accent">
                {nextChapter.title}
              </span>
            </div>
            <ArrowRight className="size-5 text-accent" aria-hidden="true" />
          </Link>
        ) : null}
      </article>
    </Section>
  );
}
