import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export class AdminAuthError extends Error {}

/**
 * Rechteprüfung für Server Actions: verifiziert Session UND admins-Tabelle,
 * genau wie app/admin/(protected)/layout.tsx. Wirft AdminAuthError, wenn der
 * Aufrufer kein Admin ist. Gibt den admin-Client (service_role) zurück, damit
 * Server Actions nie über den anon-Client schreiben.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new AdminAuthError("Nicht angemeldet.");

  const adminClient = createAdminClient();
  const { data: admin } = await adminClient
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) throw new AdminAuthError("Kein Admin-Zugriff.");

  return { userId: user.id, adminClient };
}
