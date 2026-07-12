import { notFound } from "next/navigation";

import { NewsEditor } from "@/components/admin/news/news-editor";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { getPostById } from "@/lib/queries/admin-posts";

export default async function AdminNewsEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let post: Awaited<ReturnType<typeof getPostById>> = null;
  let loadError = false;

  try {
    post = await getPostById(id);
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <>
        <AdminPageHeader title="Beitrag" />
        <ErrorState
          title="Beitrag konnte nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      </>
    );
  }

  if (!post) notFound();

  return <NewsEditor post={post} />;
}
