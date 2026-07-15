import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Callout } from "@/components/ui/callout";
import { ErrorState } from "@/components/ui/error-state";
import { Section } from "@/components/site/section";
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin";
import { TiptapRender } from "@/lib/tiptap-render";
import { getPageBySlug } from "@/lib/queries/content";
import { getPageBySlugAnyStatus } from "@/lib/queries/admin-pages";

// Bewusst OHNE revalidate/generateStaticParams -- resolvePage() liest bei
// ?preview=1 über requireAdmin() die Session-Cookies, um Admins Entwürfe
// zeigen zu können (dieselbe Begründung wie app/(site)/news/[slug]).
//
// Next.js bevorzugt beim Routing eine passende statische Route (z. B.
// app/(site)/grundlagen) immer vor diesem dynamischen [slug]-Fallback --
// eine neu angelegte Seite kann also nie /grundlagen, /news, /check usw.
// überschreiben. lib/validation/page.ts weist zusätzlich reservierte
// Slugs beim Speichern zurück, damit so eine Seite gar nicht erst
// unbemerkt unerreichbar angelegt wird.

async function resolvePage(slug: string, isPreview: boolean) {
  if (!isPreview)
    return { page: await getPageBySlug(slug), isPreviewing: false };

  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return { page: await getPageBySlug(slug), isPreviewing: false };
    }
    throw error;
  }

  return { page: await getPageBySlugAnyStatus(slug), isPreviewing: true };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const page = await getPageBySlug(slug);
    if (!page) return {};
    return { title: page.title };
  } catch {
    return {};
  }
}

export default async function CustomPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";

  let page: Awaited<ReturnType<typeof getPageBySlug>> = null;
  let previewing = false;
  let loadError = false;

  try {
    const resolved = await resolvePage(slug, isPreview);
    page = resolved.page;
    previewing = resolved.isPreviewing;
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <Section>
        <ErrorState
          title="Seite konnte nicht geladen werden"
          description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        />
      </Section>
    );
  }

  if (!page) notFound();

  return (
    <Section>
      <article className="mx-auto flex max-w-[720px] flex-col gap-6">
        {previewing ? (
          <Callout>
            Vorschau — diese Seite ist{" "}
            {page.status === "entwurf" ? "ein Entwurf" : "veröffentlicht"} und
            nur für Admins sichtbar.
          </Callout>
        ) : null}

        <h1 className="text-ink text-[34px] font-bold tracking-[-0.02em] md:text-[52px]">
          {page.title}
        </h1>

        <TiptapRender doc={page.body} />
      </article>
    </Section>
  );
}
