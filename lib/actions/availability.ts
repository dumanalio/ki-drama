"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/actions/types";
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin";
import {
  availabilityExceptionCreateSchema,
  availabilityExceptionDeleteSchema,
  availabilityExceptionUpdateSchema,
  availabilityRuleCreateSchema,
  availabilityRuleDeleteSchema,
  availabilityRuleUpdateSchema,
} from "@/lib/validation/availability";

type CreateResult = { ok: true; id: string } | { ok: false; error: string };

function fail(error: unknown, fallback: string): { ok: false; error: string } {
  if (error instanceof AdminAuthError) {
    return { ok: false, error: "Kein Zugriff. Bitte melde dich erneut an." };
  }
  console.error("[actions/availability]", error);
  return { ok: false, error: fallback };
}

export async function createAvailabilityRule(
  input: unknown
): Promise<CreateResult> {
  const parsed = availabilityRuleCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Die Regel ist ungültig.",
    };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { data, error } = await adminClient
      .from("availability_rules")
      .insert({
        weekday: parsed.data.weekday,
        start_time: parsed.data.startTime,
        end_time: parsed.data.endTime,
        slot_minutes: parsed.data.slotMinutes,
        buffer_minutes: parsed.data.bufferMinutes,
        active: parsed.data.active,
      })
      .select("id")
      .single();
    if (error) throw error;

    revalidatePath("/admin/termine");
    return { ok: true, id: data.id };
  } catch (error) {
    return fail(
      error,
      "Die Regel konnte nicht gespeichert werden. Bitte versuche es erneut."
    );
  }
}

export async function updateAvailabilityRule(
  input: unknown
): Promise<ActionResult> {
  const parsed = availabilityRuleUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Die Regel ist ungültig.",
    };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { error } = await adminClient
      .from("availability_rules")
      .update({
        weekday: parsed.data.weekday,
        start_time: parsed.data.startTime,
        end_time: parsed.data.endTime,
        slot_minutes: parsed.data.slotMinutes,
        buffer_minutes: parsed.data.bufferMinutes,
        active: parsed.data.active,
      })
      .eq("id", parsed.data.id);
    if (error) throw error;

    revalidatePath("/admin/termine");
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Die Regel konnte nicht gespeichert werden. Bitte versuche es erneut."
    );
  }
}

export async function deleteAvailabilityRule(
  input: unknown
): Promise<ActionResult> {
  const parsed = availabilityRuleDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Die Regel ist ungültig." };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { error } = await adminClient
      .from("availability_rules")
      .delete()
      .eq("id", parsed.data.id);
    if (error) throw error;

    revalidatePath("/admin/termine");
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Die Regel konnte nicht gelöscht werden. Bitte versuche es erneut."
    );
  }
}

export async function createAvailabilityException(
  input: unknown
): Promise<CreateResult> {
  const parsed = availabilityExceptionCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Die Ausnahme ist ungültig.",
    };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { data, error } = await adminClient
      .from("availability_exceptions")
      .insert({
        day: parsed.data.day,
        blocked: parsed.data.blocked,
        start_time: parsed.data.blocked ? null : parsed.data.startTime,
        end_time: parsed.data.blocked ? null : parsed.data.endTime,
        reason: parsed.data.reason,
      })
      .select("id")
      .single();
    if (error) throw error;

    revalidatePath("/admin/termine");
    return { ok: true, id: data.id };
  } catch (error) {
    return fail(
      error,
      "Die Ausnahme konnte nicht gespeichert werden. Bitte versuche es erneut."
    );
  }
}

export async function updateAvailabilityException(
  input: unknown
): Promise<ActionResult> {
  const parsed = availabilityExceptionUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Die Ausnahme ist ungültig.",
    };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { error } = await adminClient
      .from("availability_exceptions")
      .update({
        day: parsed.data.day,
        blocked: parsed.data.blocked,
        start_time: parsed.data.blocked ? null : parsed.data.startTime,
        end_time: parsed.data.blocked ? null : parsed.data.endTime,
        reason: parsed.data.reason,
      })
      .eq("id", parsed.data.id);
    if (error) throw error;

    revalidatePath("/admin/termine");
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Die Ausnahme konnte nicht gespeichert werden. Bitte versuche es erneut."
    );
  }
}

export async function deleteAvailabilityException(
  input: unknown
): Promise<ActionResult> {
  const parsed = availabilityExceptionDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Die Ausnahme ist ungültig." };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { error } = await adminClient
      .from("availability_exceptions")
      .delete()
      .eq("id", parsed.data.id);
    if (error) throw error;

    revalidatePath("/admin/termine");
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Die Ausnahme konnte nicht gelöscht werden. Bitte versuche es erneut."
    );
  }
}
