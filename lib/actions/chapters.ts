"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionResult } from "@/lib/actions/types";
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin";
import {
  chapterSaveSchema,
  chaptersReorderSchema,
} from "@/lib/validation/chapter";
import type { Json } from "@/types/database";

function fail(error: unknown, fallback: string): { ok: false; error: string } {
  if (error instanceof AdminAuthError) {
    return { ok: false, error: "Kein Zugriff. Bitte melde dich erneut an." };
  }
  console.error("[actions/chapters]", error);
  return { ok: false, error: fallback };
}

export async function createDraftChapter(): Promise<void> {
  const { adminClient } = await requireAdmin();

  const { data: maxRow } = await adminClient
    .from("chapters")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await adminClient
    .from("chapters")
    .insert({
      slug: `entwurf-${Date.now().toString(36)}`,
      title: "",
      summary: "",
      body: { type: "doc", content: [] },
      position: (maxRow?.position ?? -1) + 1,
      status: "entwurf",
    })
    .select("id")
    .single();

  if (error) throw error;

  revalidatePath("/admin/grundlagen");
  redirect(`/admin/grundlagen/${data.id}`);
}

export async function saveChapter(input: unknown): Promise<ActionResult> {
  const parsed = chapterSaveSchema.safeParse(input);
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

    const { error } = await adminClient
      .from("chapters")
      .update({
        slug: data.slug,
        title: data.title,
        summary: data.summary,
        level: data.level,
        status: data.status,
        body,
      })
      .eq("id", data.id);

    if (error) {
      if (error.code === "23505") {
        return {
          ok: false,
          error:
            "Dieser Slug wird bereits verwendet. Bitte wähle einen anderen.",
        };
      }
      throw error;
    }

    revalidatePath("/admin/grundlagen");
    revalidatePath(`/admin/grundlagen/${data.id}`);
    revalidatePath("/grundlagen");
    revalidatePath(`/grundlagen/${data.slug}`);

    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Das Kapitel konnte nicht gespeichert werden. Bitte versuche es erneut."
    );
  }
}

export async function deleteChapter(id: string): Promise<ActionResult> {
  try {
    const { adminClient } = await requireAdmin();
    const { error } = await adminClient.from("chapters").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/grundlagen");
    revalidatePath("/grundlagen");
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Das Kapitel konnte nicht gelöscht werden. Bitte versuche es erneut."
    );
  }
}

export async function reorderChapters(input: unknown): Promise<ActionResult> {
  const parsed = chaptersReorderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Die Reihenfolge ist ungültig." };
  }

  try {
    const { adminClient } = await requireAdmin();
    await Promise.all(
      parsed.data.map((id, index) =>
        adminClient.from("chapters").update({ position: index }).eq("id", id)
      )
    );

    revalidatePath("/admin/grundlagen");
    revalidatePath("/grundlagen");
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Die Reihenfolge konnte nicht gespeichert werden. Bitte versuche es erneut."
    );
  }
}
