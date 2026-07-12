import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

/**
 * Server-Component-Client mit dem `anon`-Key. Liest die Nutzer-Session aus
 * den Cookies, damit Supabase Auth im Admin-Bereich funktioniert. RLS bleibt
 * aktiv — dieser Client darf niemals für privilegierte Schreibvorgänge
 * genutzt werden.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll wird auch in Server Components aufgerufen, wo das
            // Setzen von Cookies nicht erlaubt ist. Die Middleware
            // erneuert die Session in diesem Fall.
          }
        },
      },
    }
  );
}
