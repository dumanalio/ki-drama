import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/error-state";
import { Section } from "@/components/site/section";
import { formatBerlin } from "@/lib/time";
import { TiptapRender } from "@/lib/tiptap-render";
import { getPostBySlug } from "@/lib/queries/content";

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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post: Awaited<ReturnType<typeof getPostBySlug>> = null;
  let loadError = false;

  try {
    post = await getPostBySlug(slug);
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

        {post.cover_url ? (
          <div className="bg-surface-alt overflow-hidden rounded-[20px]">
            <Image
              src={post.cover_url}
              alt={post.cover_alt ?? ""}
              width={1200}
              height={675}
              className="h-auto w-full"
              priority
            />
          </div>
        ) : null}

        <TiptapRender doc={post.body} />
      </article>
    </Section>
  );
}
