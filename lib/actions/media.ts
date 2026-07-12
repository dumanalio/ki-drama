"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/actions/types";
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin";
import {
  mediaCreateSchema,
  mediaDeleteSchema,
  mediaUpdateSchema,
} from "@/lib/validation/media";
import type { Media } from "@/types/database";

const MEDIA_BUCKET = "media";

type CreateResult = { ok: true; id: string } | { ok: false; error: string };

function fail(error: unknown, fallback: string): { ok: false; error: string } {
  if (error instanceof AdminAuthError) {
    return { ok: false, error: "Kein Zugriff. Bitte melde dich erneut an." };
  }
  console.error("[actions/media]", error);
  return { ok: false, error: fallback };
}

/** Für die Bild-Auswahl (Cover, Tiptap-Bild) aus Client Components heraus. */
export async function listMediaForPicker(): Promise<Media[]> {
  const { adminClient } = await requireAdmin();
  const { data, error } = await adminClient
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createMediaRecord(input: unknown): Promise<CreateResult> {
  const parsed = mediaCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Die Angaben sind ungültig.",
    };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { data, error } = await adminClient
      .from("media")
      .insert({
        path: parsed.data.path,
        url: parsed.data.url,
        alt: parsed.data.alt,
        caption: parsed.data.caption,
        width: parsed.data.width,
        height: parsed.data.height,
        bytes: parsed.data.bytes,
      })
      .select("id")
      .single();
    if (error) throw error;

    revalidatePath("/admin/medien");
    return { ok: true, id: data.id };
  } catch (error) {
    return fail(
      error,
      "Das Bild konnte nicht in der Bibliothek gespeichert werden. Bitte versuche es erneut."
    );
  }
}

export async function updateMediaRecord(input: unknown): Promise<ActionResult> {
  const parsed = mediaUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Die Angaben sind ungültig.",
    };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { error } = await adminClient
      .from("media")
      .update({ alt: parsed.data.alt, caption: parsed.data.caption })
      .eq("id", parsed.data.id);
    if (error) throw error;

    revalidatePath("/admin/medien");
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Die Änderungen konnten nicht gespeichert werden. Bitte versuche es erneut."
    );
  }
}

/**
 * Entfernt eine Datei aus dem Storage-Bucket, die zwar hochgeladen, aber nie
 * mit Alt-Text bestätigt wurde (Nutzer hat den Pending-Upload abgebrochen).
 * Es existiert dafür noch keine media-Zeile.
 */
export async function discardUploadedFile(path: string): Promise<ActionResult> {
  if (typeof path !== "string" || !path.startsWith("uploads/")) {
    return { ok: false, error: "Ungültiger Pfad." };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { error } = await adminClient.storage
      .from(MEDIA_BUCKET)
      .remove([path]);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return fail(error, "Die Datei konnte nicht entfernt werden.");
  }
}

export async function deleteMediaRecord(input: unknown): Promise<ActionResult> {
  const parsed = mediaDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Der Eintrag ist ungültig." };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { data: media, error: fetchError } = await adminClient
      .from("media")
      .select("path")
      .eq("id", parsed.data.id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!media) {
      return { ok: false, error: "Dieses Bild wurde nicht gefunden." };
    }

    const { error: storageError } = await adminClient.storage
      .from(MEDIA_BUCKET)
      .remove([media.path]);
    if (storageError) throw storageError;

    const { error: deleteError } = await adminClient
      .from("media")
      .delete()
      .eq("id", parsed.data.id);
    if (deleteError) throw deleteError;

    revalidatePath("/admin/medien");
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Das Bild konnte nicht gelöscht werden. Bitte versuche es erneut."
    );
  }
}
