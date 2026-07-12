import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBerlin } from "@/lib/time";

export default async function CheckDankePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let startsAt: string | null = null;
  if (token) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("bookings")
      .select("starts_at")
      .eq("manage_token", token)
      .eq("status", "gebucht")
      .maybeSingle();
    startsAt = data?.starts_at ?? null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <span className="bg-success-soft mb-6 flex size-14 items-center justify-center rounded-full">
        <CheckCircle2 className="text-success size-7" aria-hidden="true" />
      </span>
      <h1 className="text-ink mb-3 text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
        Termin gebucht
      </h1>
      {startsAt ? (
        <p className="text-ink-soft mb-8 max-w-[45ch] text-[16px] leading-relaxed">
          Du bist eingetragen für{" "}
          {formatBerlin(startsAt, {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          Uhr. Eine Bestätigung mit allen Details ist unterwegs zu deinem
          Postfach.
        </p>
      ) : (
        <p className="text-ink-soft mb-8 max-w-[45ch] text-[16px] leading-relaxed">
          Danke für deinen Check. Du erhältst in Kürze eine Bestätigung per
          E-Mail.
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        {token ? (
          <Button variant="outline" render={<a href={`/api/ics/${token}`} />}>
            Kalendereintrag herunterladen
          </Button>
        ) : null}
        <Button variant="primary" render={<Link href="/" />}>
          Zur Startseite
        </Button>
      </div>
    </div>
  );
}
