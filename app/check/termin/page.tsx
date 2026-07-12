import { redirect } from "next/navigation";

import { TerminBooking } from "@/components/check/termin-booking";

export default async function CheckTerminPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session } = await searchParams;
  if (!session) redirect("/check");

  return <TerminBooking sessionId={session} />;
}
