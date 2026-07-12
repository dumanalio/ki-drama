import { createAdminClient } from "@/lib/supabase/admin";
import type { Tool } from "@/types/database";

export async function getToolsForList(): Promise<Tool[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .order("position", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getToolById(id: string): Promise<Tool | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
