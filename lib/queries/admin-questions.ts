import { createAdminClient } from "@/lib/supabase/admin";
import type { QuizQuestion } from "@/types/database";

export async function getQuestionsForList(): Promise<QuizQuestion[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .order("position", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getQuestionById(
  id: string
): Promise<QuizQuestion | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
