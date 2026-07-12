import { createPublicClient } from "@/lib/supabase/public";
import type { Chapter, Post, QuizQuestion, Tool } from "@/types/database";

export async function getPublishedChapters(): Promise<Chapter[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("status", "veroeffentlicht")
    .order("position", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getChapterBySlug(slug: string): Promise<Chapter | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("status", "veroeffentlicht")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getPublishedTools(): Promise<Tool[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .eq("status", "veroeffentlicht")
    .order("category", { ascending: true })
    .order("position", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getPublishedPosts(limit?: number): Promise<Post[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("posts")
    .select("*")
    .eq("status", "veroeffentlicht")
    .order("published_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "veroeffentlicht")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getActiveQuizQuestions(): Promise<QuizQuestion[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("active", true)
    .order("position", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
