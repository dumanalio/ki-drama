"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionResult } from "@/lib/actions/types";
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin";
import { slugify } from "@/lib/slugify";
import {
  questionSaveSchema,
  questionsReorderSchema,
} from "@/lib/validation/question";
import type { QuizOption } from "@/types/database";

function fail(error: unknown, fallback: string): { ok: false; error: string } {
  if (error instanceof AdminAuthError) {
    return { ok: false, error: "Kein Zugriff. Bitte melde dich erneut an." };
  }
  console.error("[actions/questions]", error);
  return { ok: false, error: fallback };
}

export async function createDraftQuestion(): Promise<void> {
  const { adminClient } = await requireAdmin();

  const { data: maxRow } = await adminClient
    .from("quiz_questions")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await adminClient
    .from("quiz_questions")
    .insert({
      position: (maxRow?.position ?? 0) + 1,
      type: "single",
      segment: "alle",
      title: "",
      options: [],
      required: true,
      active: false,
    })
    .select("id")
    .single();

  if (error) throw error;

  revalidatePath("/admin/fragen");
  redirect(`/admin/fragen/${data.id}`);
}

export async function saveQuestion(input: unknown): Promise<ActionResult> {
  const parsed = questionSaveSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Die Angaben sind ungültig.",
    };
  }

  try {
    const { adminClient } = await requireAdmin();
    const data = parsed.data;

    const options: QuizOption[] = data.options.map((option) => ({
      value: slugify(option.label) || Math.random().toString(36).slice(2, 8),
      label: option.label,
      description: option.description ?? undefined,
    }));

    const { error } = await adminClient
      .from("quiz_questions")
      .update({
        type: data.type,
        segment: data.segment,
        title: data.title,
        hint: data.hint,
        options,
        required: data.required,
        active: data.active,
      })
      .eq("id", data.id);

    if (error) throw error;

    revalidatePath("/admin/fragen");
    revalidatePath(`/admin/fragen/${data.id}`);
    revalidatePath("/check");

    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Die Frage konnte nicht gespeichert werden. Bitte versuche es erneut."
    );
  }
}

export async function deleteQuestion(id: string): Promise<ActionResult> {
  try {
    const { adminClient } = await requireAdmin();
    const { error } = await adminClient
      .from("quiz_questions")
      .delete()
      .eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/fragen");
    revalidatePath("/check");
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Die Frage konnte nicht gelöscht werden. Bitte versuche es erneut."
    );
  }
}

export async function reorderQuestions(input: unknown): Promise<ActionResult> {
  const parsed = questionsReorderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Die Reihenfolge ist ungültig." };
  }

  try {
    const { adminClient } = await requireAdmin();
    await Promise.all(
      parsed.data.map((id, index) =>
        adminClient
          .from("quiz_questions")
          .update({ position: index })
          .eq("id", id)
      )
    );

    revalidatePath("/admin/fragen");
    revalidatePath("/check");
    return { ok: true };
  } catch (error) {
    return fail(
      error,
      "Die Reihenfolge konnte nicht gespeichert werden. Bitte versuche es erneut."
    );
  }
}
