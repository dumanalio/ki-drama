import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * NIEMALS in eine Client Component importieren. Dieser Client nutzt den
 * `service_role`-Key und umgeht RLS vollständig. Er darf ausschließlich in
 * Route Handlers (app/api/...) oder Server Actions verwendet werden — nie
 * in Code, der im Browser-Bundle landet.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
