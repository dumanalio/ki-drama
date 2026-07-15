import { createAdminClient } from "@/lib/supabase/admin";
import type { Page } from "@/types/database";

export async function getPagesForList(): Promise<Page[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPageById(id: string): Promise<Page | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Lädt eine Seite unabhängig vom Status — nur für die Admin-Vorschau. */
export async function getPageBySlugAnyStatus(
  slug: string
): Promise<Page | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}
