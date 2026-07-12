import { notFound } from "next/navigation";

import { VerschiebenBooking } from "@/components/termin/verschieben-booking";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function VerschiebenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("status")
    .eq("manage_token", token)
    .maybeSingle();

  if (!booking || booking.status !== "gebucht") notFound();

  return <VerschiebenBooking token={token} />;
}
