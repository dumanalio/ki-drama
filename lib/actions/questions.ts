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
import type { QuestionSegment, QuizOption } from "@/types/database";

type DuplicateResult = { ok: true; id: string } | { ok: false; error: string };

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

  // revalidatePath ist hier unzulässig (läuft während des Renderns von
  // /admin/fragen/neu) und unnötig, da die Liste ohnehin dynamisch ist.
  redirect(`/admin/fragen/${data.id}`);
}

const OTHER_SEGMENT: Record<"privat" | "business", QuestionSegment> = {
  privat: "business",
  business: "privat",
};

/** Kopiert eine Frage inkl. Optionen/Icons und setzt das jeweils andere Segment. */
export async function duplicateQuestion(id: string): Promise<DuplicateResult> {
  try {
    const { adminClient } = await requireAdmin();

    const { data: source, error: fetchError } = await adminClient
      .from("quiz_questions")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    if (source.segment !== "privat" && source.segment !== "business") {
      return {
        ok: false,
        error:
          'Fragen mit Segment „Alle" gelten bereits für beide Gruppen und können nicht dupliziert werden.',
      };
    }

    const { data: maxRow } = await adminClient
      .from("quiz_questions")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: inserted, error: insertError } = await adminClient
      .from("quiz_questions")
      .insert({
        position: (maxRow?.position ?? 0) + 1,
        type: source.type,
        segment: OTHER_SEGMENT[source.segment],
        title: source.title,
        hint: source.hint,
        options: source.options,
        icon_align: source.icon_align,
        text_align: source.text_align,
        required: source.required,
        active: source.active,
      })
      .select("id")
      .single();
    if (insertError) throw insertError;

    revalidatePath("/admin/fragen");
    revalidatePath("/check");

    return { ok: true, id: inserted.id };
  } catch (error) {
    return fail(
      error,
      "Die Frage konnte nicht dupliziert werden. Bitte versuche es erneut."
    );
  }
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
      iconUrl: option.iconUrl ?? undefined,
      iconAlt: option.iconAlt ?? undefined,
    }));

    const { error } = await adminClient
      .from("quiz_questions")
      .update({
        type: data.type,
        segment: data.segment,
        title: data.title,
        hint: data.hint,
        options,
        icon_align: data.iconAlign,
        text_align: data.textAlign,
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
