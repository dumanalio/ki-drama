import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Admin-Prüfung ausschließlich über den admin-Client — nie über anon,
    // auch nicht für diesen Vorab-Check.
    const adminClient = createAdminClient();
    const { data: admin } = await adminClient
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (admin) redirect("/admin");
  }

  return (
    <div className="bg-canvas flex min-h-screen items-center justify-center px-6">
      <div className="border-line bg-surface shadow-card w-full max-w-[400px] rounded-xl border p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="font-display text-ink text-[20px] font-bold">
            KI-Drama
          </span>
          <h1 className="text-ink text-[20px] font-semibold tracking-[-0.01em]">
            Anmelden
          </h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
