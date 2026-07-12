import { notFound } from "next/navigation";

import { Callout } from "@/components/ui/callout";
import { Section } from "@/components/site/section";
import { TerminActions } from "@/components/termin/termin-actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBerlin } from "@/lib/time";

export default async function TerminPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("starts_at, status, message")
    .eq("manage_token", token)
    .maybeSingle();

  if (!booking) notFound();

  return (
    <Section>
      <div className="mx-auto flex max-w-[560px] flex-col gap-6">
        <h1 className="text-ink text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
          Dein Termin
        </h1>

        <div className="border-line bg-surface shadow-card flex flex-col gap-1 rounded-xl border p-5">
          <span className="text-ink text-[18px] font-semibold">
            {formatBerlin(booking.starts_at, {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            Uhr
          </span>
          {booking.message ? (
            <p className="text-ink-soft mt-2 text-[15px] leading-relaxed">
              {booking.message}
            </p>
          ) : null}
        </div>

        {booking.status === "gebucht" ? (
          <TerminActions token={token} />
        ) : (
          <Callout>Dieser Termin wurde abgesagt.</Callout>
        )}
      </div>
    </Section>
  );
}
