"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionResult } from "@/lib/actions/types";
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin";
import { toolSaveSchema, toolsReorderSchema } from "@/lib/validation/tool";

function fail(error: unknown, fallback: string): { ok: false; error: string } {
  if (error instanceof AdminAuthError) {
    return { ok: false, error: "Kein Zugriff. Bitte melde dich erneut an." };
  }
  console.error("[actions/tools]", error);
  return { ok: false, error: fallback };
}

export async function createDraftTool(): Promise<void> {
  const { adminClient } = await requireAdmin();

  const { data: maxRow } = await adminClient
    .from("tools")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await adminClient
    .from("tools")
    .insert({
      slug: `entwurf-${Date.now().toString(36)}`,
      name: "",
      category: "",
      summary: "",
      position: (maxRow?.position ?? -1) + 1,
      status: "entwurf",
    })
    .select("id")
    .single();

  if (error) throw error;

  // revalidatePath ist hier unzulässig (läuft während des Renderns von
  // /admin/landschaft/neu) und unnötig, da die Liste ohnehin dynamisch ist.
  redirect(`/admin/landschaft/${data.id}`);
}

export async function saveTool(input: unknown): Promise<ActionResult> {
  const parsed = toolSaveSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Die Angaben sind ungültig.",
    };
  }

  try {
    const { adminClient } = await requireAdmin();
    const data = parsed.data;

    const { error } = await adminClient
      .from("tools")
      .update({
        slug: data.slug,
        name: data.name,
        vendor: data.vendor,
        category: data.category,
        summary: data.summary,
        good_for: data.goodFor,
        watch_out: data.watchOut,
        logo_url: data.logoUrl,
        website: data.website,
        price_hint: data.priceHint,
        status: data.status,
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

    revalidatePath("/admin/landschaft");
    revalidatePath(`/admin/landschaft/${data.id}`);
    revalidatePath("/landschaft");

    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Das Tool konnte nicht gespeichert werden. Bitte versuche es erneut."
    );
  }
}

export async function deleteTool(id: string): Promise<ActionResult> {
  try {
    const { adminClient } = await requireAdmin();
    const { error } = await adminClient.from("tools").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/landschaft");
    revalidatePath("/landschaft");
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Das Tool konnte nicht gelöscht werden. Bitte versuche es erneut."
    );
  }
}

export async function reorderTools(input: unknown): Promise<ActionResult> {
  const parsed = toolsReorderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Die Reihenfolge ist ungültig." };
  }

  try {
    const { adminClient } = await requireAdmin();
    await Promise.all(
      parsed.data.map((id, index) =>
        adminClient.from("tools").update({ position: index }).eq("id", id)
      )
    );

    revalidatePath("/admin/landschaft");
    revalidatePath("/landschaft");
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Die Reihenfolge konnte nicht gespeichert werden. Bitte versuche es erneut."
    );
  }
}
