import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { ErrorState } from "@/components/ui/error-state";
import { Section } from "@/components/site/section";
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin";
import { formatBerlin } from "@/lib/time";
import { TiptapRender } from "@/lib/tiptap-render";
import { getPostBySlug } from "@/lib/queries/content";
import { getPostBySlugAnyStatus } from "@/lib/queries/admin-posts";

// Bewusst OHNE revalidate/generateStaticParams: resolvePost() liest bei
// ?preview=1 über requireAdmin() die Session-Cookies, um Admins Entwürfe
// zeigen zu können. Das ist mit statischem Rendering nicht vereinbar
// (Next.js wirft DYNAMIC_SERVER_USAGE) — die Korrektheit der
// Vorschau-Funktion hat hier Vorrang vor dem Cache-Vorteil für diese
// einzelne Seite. Die Beitragsliste (/news) ist weiterhin statisch.

async function resolvePost(slug: string, isPreview: boolean) {
  if (!isPreview)
    return { post: await getPostBySlug(slug), isPreviewing: false };

  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return { post: await getPostBySlug(slug), isPreviewing: false };
    }
    throw error;
  }

  return { post: await getPostBySlugAnyStatus(slug), isPreviewing: true };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getPostBySlug(slug);
    if (!post) return {};

    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: "article",
        images: post.cover_url ? [{ url: post.cover_url }] : undefined,
      },
    };
  } catch {
    return {};
  }
}

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";

  let post: Awaited<ReturnType<typeof getPostBySlug>> = null;
  let previewing = false;
  let loadError = false;

  try {
    const resolved = await resolvePost(slug, isPreview);
    post = resolved.post;
    previewing = resolved.isPreviewing;
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <Section>
        <ErrorState
          title="Beitrag konnte nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      </Section>
    );
  }

  if (!post) notFound();

  return (
    <Section>
      <article className="mx-auto flex max-w-[720px] flex-col gap-6">
        {previewing ? (
          <Callout>
            Vorschau — dieser Beitrag ist{" "}
            {post.status === "entwurf" ? "ein Entwurf" : "veröffentlicht"} und
            nur für Admins sichtbar.
          </Callout>
        ) : null}

        <div className="flex flex-col gap-3">
          <Badge variant="soft" className="self-start">
            {post.category}
          </Badge>
          <h1 className="text-ink text-[34px] font-bold tracking-[-0.02em] md:text-[52px]">
            {post.title}
          </h1>
          <span className="text-ink-muted text-[14px]">
            {post.published_at ? formatBerlin(post.published_at) : null}
            {post.published_at ? " · " : null}
            {post.reading_min} Min. Lesezeit
          </span>
        </div>

        <TiptapRender doc={post.body} />
      </article>
    </Section>
  );
}
