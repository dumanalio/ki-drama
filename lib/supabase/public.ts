import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Anon-Client für rein öffentliche, nutzerunabhängige Lesevorgänge
 * (veröffentlichte Inhalte). Bewusst OHNE Cookie-Zugriff — anders als
 * lib/supabase/server.ts, dessen createClient() next/headers:cookies()
 * aufruft. Jeder Aufruf von cookies() zwingt Next.js, die gesamte Route
 * dynamisch (bei jedem Request neu) zu rendern, selbst wenn die Antwort
 * gar nicht vom Cookie abhängt. Seiten, die ausschließlich über diesen
 * Client lesen, bleiben statisch/ISR-fähig — die Admin-Aktionen rufen
 * bereits revalidatePath() auf, sobald sich Inhalte ändern.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
