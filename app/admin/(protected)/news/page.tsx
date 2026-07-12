import Link from "next/link";
import { Newspaper, Plus } from "lucide-react";

import { NewsList } from "@/components/admin/news/news-list";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { getPostsForList } from "@/lib/queries/admin-posts";

export default async function AdminNewsPage() {
  let posts: Awaited<ReturnType<typeof getPostsForList>> = [];
  let loadError = false;

  try {
    posts = await getPostsForList();
  } catch {
    loadError = true;
  }

  return (
    <>
      <AdminPageHeader
        title="News"
        action={
          <Link
            href="/admin/news/neu"
            className={buttonVariants({ variant: "primary" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            Neuer Beitrag
          </Link>
        }
      />

      {loadError ? (
        <ErrorState
          title="Beiträge konnten nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="Noch keine Beiträge"
          description="Erstelle deinen ersten News-Beitrag."
        />
      ) : (
        <NewsList posts={posts} />
      )}
    </>
  );
}
