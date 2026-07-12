"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/actions/types";
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin";
import { LEAD_STATUS_LABELS } from "@/lib/labels";
import {
  leadActivityCreateSchema,
  leadNotesUpdateSchema,
  leadStatusUpdateSchema,
} from "@/lib/validation/lead";

export async function updateLeadStatus(input: unknown): Promise<ActionResult> {
  const parsed = leadStatusUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Der Status ist ungültig." };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { leadId, status } = parsed.data;

    const { error: updateError } = await adminClient
      .from("leads")
      .update({ status })
      .eq("id", leadId);

    if (updateError) throw updateError;

    await adminClient.from("lead_activities").insert({
      lead_id: leadId,
      kind: "status",
      body: `Status geändert zu „${LEAD_STATUS_LABELS[status]}“`,
    });

    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/leads");
    revalidatePath("/admin");

    return { ok: true };
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return { ok: false, error: "Kein Zugriff. Bitte melde dich erneut an." };
    }
    console.error("[actions/leads] updateLeadStatus fehlgeschlagen:", error);
    return {
      ok: false,
      error:
        "Der Status konnte nicht gespeichert werden. Bitte versuche es erneut.",
    };
  }
}

export async function updateLeadNotes(input: unknown): Promise<ActionResult> {
  const parsed = leadNotesUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Die Notiz ist ungültig." };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { leadId, notes } = parsed.data;

    const { error: updateError } = await adminClient
      .from("leads")
      .update({ notes: notes.length > 0 ? notes : null })
      .eq("id", leadId);

    if (updateError) throw updateError;

    revalidatePath(`/admin/leads/${leadId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return { ok: false, error: "Kein Zugriff. Bitte melde dich erneut an." };
    }
    console.error("[actions/leads] updateLeadNotes fehlgeschlagen:", error);
    return {
      ok: false,
      error:
        "Die Notiz konnte nicht gespeichert werden. Bitte versuche es erneut.",
    };
  }
}

export async function addLeadActivity(input: unknown): Promise<ActionResult> {
  const parsed = leadActivityCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Die Notiz ist ungültig.",
    };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { leadId, body } = parsed.data;

    const { error: insertError } = await adminClient
      .from("lead_activities")
      .insert({ lead_id: leadId, kind: "notiz", body });

    if (insertError) throw insertError;

    revalidatePath(`/admin/leads/${leadId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return { ok: false, error: "Kein Zugriff. Bitte melde dich erneut an." };
    }
    console.error("[actions/leads] addLeadActivity fehlgeschlagen:", error);
    return {
      ok: false,
      error:
        "Die Notiz konnte nicht gespeichert werden. Bitte versuche es erneut.",
    };
  }
}
