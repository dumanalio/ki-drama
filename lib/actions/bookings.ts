"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/actions/types";
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin";
import { BOOKING_STATUS_LABELS } from "@/lib/labels";
import {
  bookingCancelSchema,
  bookingStatusUpdateSchema,
} from "@/lib/validation/booking-admin";

export async function updateBookingStatus(
  input: unknown
): Promise<ActionResult> {
  const parsed = bookingStatusUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Der Status ist ungültig." };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { bookingId, status } = parsed.data;

    const { data: booking, error: fetchError } = await adminClient
      .from("bookings")
      .select("lead_id")
      .eq("id", bookingId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!booking) {
      return { ok: false, error: "Dieser Termin wurde nicht gefunden." };
    }

    const { error: updateError } = await adminClient
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (updateError) throw updateError;

    await adminClient.from("lead_activities").insert({
      lead_id: booking.lead_id,
      kind: "termin",
      body: `Termin-Status geändert zu „${BOOKING_STATUS_LABELS[status]}“`,
    });

    revalidatePath("/admin/termine");
    revalidatePath(`/admin/leads/${booking.lead_id}`);
    revalidatePath("/admin");

    return { ok: true };
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return { ok: false, error: "Kein Zugriff. Bitte melde dich erneut an." };
    }
    console.error(
      "[actions/bookings] updateBookingStatus fehlgeschlagen:",
      error
    );
    return {
      ok: false,
      error:
        "Der Status konnte nicht gespeichert werden. Bitte versuche es erneut.",
    };
  }
}

export async function cancelBooking(input: unknown): Promise<ActionResult> {
  const parsed = bookingCancelSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Der Termin ist ungültig." };
  }

  try {
    const { adminClient } = await requireAdmin();
    const { bookingId } = parsed.data;

    const { data: booking, error: fetchError } = await adminClient
      .from("bookings")
      .select("lead_id, status")
      .eq("id", bookingId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!booking) {
      return { ok: false, error: "Dieser Termin wurde nicht gefunden." };
    }
    if (booking.status !== "gebucht") {
      return {
        ok: false,
        error: "Dieser Termin ist bereits abgesagt oder abgeschlossen.",
      };
    }

    const { error: updateError } = await adminClient
      .from("bookings")
      .update({ status: "abgesagt" })
      .eq("id", bookingId);

    if (updateError) throw updateError;

    await adminClient.from("lead_activities").insert({
      lead_id: booking.lead_id,
      kind: "termin",
      body: "Termin abgesagt",
    });

    revalidatePath("/admin/termine");
    revalidatePath(`/admin/leads/${booking.lead_id}`);
    revalidatePath("/admin");

    return { ok: true };
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return { ok: false, error: "Kein Zugriff. Bitte melde dich erneut an." };
    }
    console.error("[actions/bookings] cancelBooking fehlgeschlagen:", error);
    return {
      ok: false,
      error:
        "Der Termin konnte nicht abgesagt werden. Bitte versuche es erneut.",
    };
  }
}
