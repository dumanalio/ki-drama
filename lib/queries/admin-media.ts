import { createAdminClient } from "@/lib/supabase/admin";
import type { Media } from "@/types/database";

export async function getMediaLibrary(): Promise<Media[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
