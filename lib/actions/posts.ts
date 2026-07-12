"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionResult } from "@/lib/actions/types";
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin";
import { estimateReadingMinutes } from "@/lib/tiptap-render";
import { postSaveSchema } from "@/lib/validation/post";
import type { Json } from "@/types/database";

function fail(error: unknown, fallback: string): { ok: false; error: string } {
  if (error instanceof AdminAuthError) {
    return { ok: false, error: "Kein Zugriff. Bitte melde dich erneut an." };
  }
  console.error("[actions/posts]", error);
  return { ok: false, error: fallback };
}

export async function createDraftPost(): Promise<void> {
  const { adminClient } = await requireAdmin();

  const { data, error } = await adminClient
    .from("posts")
    .insert({
      title: "",
      slug: `entwurf-${Date.now().toString(36)}`,
      excerpt: "",
      body: { type: "doc", content: [] },
      status: "entwurf",
    })
    .select("id")
    .single();

  if (error) throw error;

  // revalidatePath ist hier unzulässig (läuft während des Renderns von
  // /admin/news/neu, nicht als eigenständige Mutation) und auch unnötig,
  // da /admin/news ohnehin bei jedem Aufruf dynamisch neu gerendert wird.
  redirect(`/admin/news/${data.id}`);
}

export async function savePost(input: unknown): Promise<ActionResult> {
  const parsed = postSaveSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Die Angaben sind ungültig.",
    };
  }

  try {
    const { adminClient } = await requireAdmin();
    const data = parsed.data;
    const body = data.body as unknown as Json;

    const { data: existing, error: fetchError } = await adminClient
      .from("posts")
      .select("status, published_at")
      .eq("id", data.id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!existing) {
      return { ok: false, error: "Dieser Beitrag wurde nicht gefunden." };
    }

    const publishedAt =
      data.status === "veroeffentlicht" && !existing.published_at
        ? new Date().toISOString()
        : existing.published_at;

    const { error: updateError } = await adminClient
      .from("posts")
      .update({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        category: data.category,
        tags: data.tags,
        cover_url: data.coverUrl,
        cover_alt: data.coverAlt,
        status: data.status,
        body,
        reading_min: estimateReadingMinutes(body),
        published_at: publishedAt,
      })
      .eq("id", data.id);

    if (updateError) {
      if (updateError.code === "23505") {
        return {
          ok: false,
          error:
            "Dieser Slug wird bereits verwendet. Bitte wähle einen anderen.",
        };
      }
      throw updateError;
    }

    revalidatePath("/admin/news");
    revalidatePath(`/admin/news/${data.id}`);
    revalidatePath("/news");
    revalidatePath(`/news/${data.slug}`);

    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Der Beitrag konnte nicht gespeichert werden. Bitte versuche es erneut."
    );
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    const { adminClient } = await requireAdmin();
    const { error } = await adminClient.from("posts").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/news");
    revalidatePath("/news");
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Der Beitrag konnte nicht gelöscht werden. Bitte versuche es erneut."
    );
  }
}
