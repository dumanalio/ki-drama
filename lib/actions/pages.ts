"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionResult } from "@/lib/actions/types";
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin";
import { pageSaveSchema } from "@/lib/validation/page";
import type { Json } from "@/types/database";

function fail(
  error: unknown,
  fallback: string,
  context: string
): { ok: false; error: string } {
  if (error instanceof AdminAuthError) {
    return { ok: false, error: "Kein Zugriff. Bitte melde dich erneut an." };
  }
  const supabaseError = error as {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  } | null;
  console.error(`[actions/pages] ${context}`, {
    message: supabaseError?.message,
    code: supabaseError?.code,
    details: supabaseError?.details,
    hint: supabaseError?.hint,
    raw: error,
  });
  return { ok: false, error: fallback };
}

/** Für /admin/seiten/neu -- legt einen Entwurf an und leitet direkt zum Editor um. */
export async function createDraftPage(): Promise<void> {
  const { adminClient } = await requireAdmin();

  const { data, error } = await adminClient
    .from("pages")
    .insert({
      title: "",
      slug: `entwurf-${Date.now().toString(36)}`,
      body: { type: "doc", content: [] },
      status: "entwurf",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[actions/pages] createDraftPage", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  redirect(`/admin/seiten/${data.id}`);
}

type CreateForLinkResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string };

/**
 * Für den "+ Neue Seite verlinken"-Button in der Navigations-/Footer-
 * Pflege: legt einen Entwurf an, OHNE umzuleiten -- der Aufrufer fügt
 * selbst einen Navigationspunkt mit dem Slug hinzu.
 */
export async function createDraftPageForLink(): Promise<CreateForLinkResult> {
  try {
    const { adminClient } = await requireAdmin();
    const { data, error } = await adminClient
      .from("pages")
      .insert({
        title: "",
        slug: `neue-seite-${Date.now().toString(36)}`,
        body: { type: "doc", content: [] },
        status: "entwurf",
      })
      .select("id, slug")
      .single();
    if (error) throw error;

    revalidatePath("/admin/seiten");
    return { ok: true, id: data.id, slug: data.slug };
  } catch (error) {
    return fail(
      error,
      "Die Seite konnte nicht angelegt werden. Bitte versuche es erneut.",
      "createDraftPageForLink"
    );
  }
}

export async function savePage(input: unknown): Promise<ActionResult> {
  const parsed = pageSaveSchema.safeParse(input);
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
      .from("pages")
      .select("id, slug")
      .eq("id", data.id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!existing) {
      return { ok: false, error: "Diese Seite wurde nicht gefunden." };
    }

    const { error: updateError } = await adminClient
      .from("pages")
      .update({
        title: data.title,
        slug: data.slug,
        status: data.status,
        body,
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

    revalidatePath("/admin/seiten");
    revalidatePath(`/admin/seiten/${data.id}`);
    if (existing.slug !== data.slug) revalidatePath(`/${existing.slug}`);
    revalidatePath(`/${data.slug}`);

    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Die Seite konnte nicht gespeichert werden. Bitte versuche es erneut.",
      "savePage"
    );
  }
}

export async function deletePage(id: string): Promise<ActionResult> {
  try {
    const { adminClient } = await requireAdmin();
    const { data: existing } = await adminClient
      .from("pages")
      .select("slug")
      .eq("id", id)
      .maybeSingle();

    const { error } = await adminClient.from("pages").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/seiten");
    if (existing?.slug) revalidatePath(`/${existing.slug}`);
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Die Seite konnte nicht gelöscht werden. Bitte versuche es erneut.",
      "deletePage"
    );
  }
}
