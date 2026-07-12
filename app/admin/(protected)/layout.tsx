import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Zweite Schutzebene, unabhängig von middleware.ts: Die Middleware prüft nur,
 * ob überhaupt eine Session existiert. Hier wird zusätzlich — bei jedem
 * Aufruf, serverseitig — geprüft, ob der eingeloggte Nutzer wirklich in der
 * Tabelle admins steht. Die Prüfung selbst läuft über den admin-Client
 * (service_role), nie über anon, auch wenn die RLS-Policy auf admins einer
 * eingeloggten Session theoretisch denselben Zugriff erlauben würde.
 */
export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const adminClient = createAdminClient();
  const { data: admin } = await adminClient
    .from("admins")
    .select("email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) redirect("/admin/login");

  return (
    <div className="bg-canvas flex min-h-screen flex-col md:flex-row">
      <AdminSidebar adminEmail={admin.email} />
      <main className="flex-1 px-6 py-8 md:px-10 md:py-10">{children}</main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "!bg-surface !border !border-line !shadow-float !rounded-xl",
            title: "!text-ink !text-[14px] !font-medium",
            description: "!text-ink-muted !text-[13px]",
            actionButton: "!bg-ink !text-white",
            success: "!border-l-4 !border-l-success",
            error: "!border-l-4 !border-l-danger",
          },
        }}
      />
    </div>
  );
}
