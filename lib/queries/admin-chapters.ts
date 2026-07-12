import { createAdminClient } from "@/lib/supabase/admin";
import type { Chapter } from "@/types/database";

export async function getChaptersForList(): Promise<Chapter[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .order("position", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getChapterById(id: string): Promise<Chapter | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
