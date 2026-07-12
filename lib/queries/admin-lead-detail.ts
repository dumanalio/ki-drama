import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Booking,
  Json,
  Lead,
  LeadActivity,
  QuizQuestion,
} from "@/types/database";

export interface AnsweredQuestion {
  question: QuizQuestion;
  rawAnswer: Json;
}

export interface LeadDetailData {
  lead: Lead;
  answeredQuestions: AnsweredQuestion[];
  bookings: Booking[];
  activities: LeadActivity[];
}

/**
 * Lädt alles für die Lead-Detailseite in parallelen Abfragen. Fragen werden
 * unabhängig von active/position geladen, damit auch Antworten auf
 * inzwischen geänderte oder deaktivierte Fragen korrekt beschriftet bleiben.
 */
export async function getLeadDetail(
  leadId: string
): Promise<LeadDetailData | null> {
  const supabase = createAdminClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  if (leadError) throw leadError;
  if (!lead) return null;

  const [responseResult, questionsResult, bookingsResult, activitiesResult] =
    await Promise.all([
      supabase
        .from("quiz_responses")
        .select("answers, completed, created_at")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("quiz_questions").select("*"),
      supabase
        .from("bookings")
        .select("*")
        .eq("lead_id", leadId)
        .order("starts_at", { ascending: false }),
      supabase
        .from("lead_activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false }),
    ]);

  if (responseResult.error) throw responseResult.error;
  if (questionsResult.error) throw questionsResult.error;
  if (bookingsResult.error) throw bookingsResult.error;
  if (activitiesResult.error) throw activitiesResult.error;

  const questionById = new Map(
    (questionsResult.data ?? []).map((question) => [question.id, question])
  );

  const answers = responseResult.data?.answers ?? {};
  const answeredQuestions: AnsweredQuestion[] = Object.entries(answers)
    .map(([questionId, rawAnswer]) => {
      const question = questionById.get(questionId);
      return question ? { question, rawAnswer } : null;
    })
    .filter((entry): entry is AnsweredQuestion => entry !== null)
    .sort((a, b) => a.question.position - b.question.position);

  return {
    lead,
    answeredQuestions,
    bookings: bookingsResult.data ?? [],
    activities: activitiesResult.data ?? [],
  };
}
