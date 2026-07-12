import { Newspaper } from "lucide-react";

import { NewsFilter } from "@/components/site/news-filter";
import { Section } from "@/components/site/section";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { getPublishedPosts } from "@/lib/queries/content";
import type { Post } from "@/types/database";

export default async function NewsPage() {
  let posts: Post[] = [];
  let loadError = false;

  try {
    posts = await getPublishedPosts();
  } catch {
    loadError = true;
  }

  return (
    <Section>
      <div className="mb-10 flex flex-col gap-3">
        <span className="text-ink-muted text-[13px] font-semibold tracking-[0.06em] uppercase">
          News
        </span>
        <h1 className="text-ink text-[34px] font-bold tracking-[-0.02em] md:text-[52px]">
          Was gerade passiert
        </h1>
        <p className="text-ink-soft max-w-[65ch] text-[17px] leading-relaxed">
          Kurz eingeordnet, ohne Panikmache.
        </p>
      </div>

      {loadError ? (
        <ErrorState
          title="Beiträge konnten nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="Noch keine Beiträge veröffentlicht"
          description="Hier erscheinen in Kürze die ersten News."
        />
      ) : (
        <NewsFilter posts={posts} />
      )}
    </Section>
  );
}
