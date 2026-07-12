"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/modal";
import { cancelBooking } from "@/lib/actions/bookings";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_VARIANTS } from "@/lib/labels";
import { formatBerlin } from "@/lib/time";
import type { Booking } from "@/types/database";

export function LeadBookingPanel({ booking }: { booking: Booking }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelBooking({ bookingId: booking.id });
      if (result.ok) {
        setConfirmOpen(false);
        toast.success("Termin abgesagt");
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="border-line rounded-xl border p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-ink text-[15px] font-medium">
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
        <Badge variant={BOOKING_STATUS_VARIANTS[booking.status]}>
          {BOOKING_STATUS_LABELS[booking.status]}
        </Badge>
      </div>

      {booking.meeting_url ? (
        <a
          href={booking.meeting_url}
          target="_blank"
          rel="noreferrer"
          className="text-accent hover:text-accent-hover focus-visible:ring-accent mb-3 flex w-fit items-center gap-1.5 rounded text-[14px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Meeting-Link öffnen
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      ) : null}

      {booking.status === "gebucht" ? (
        <Modal open={confirmOpen} onOpenChange={setConfirmOpen}>
          <ModalTrigger
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Termin absagen
          </ModalTrigger>
          <ModalContent
            title="Termin absagen?"
            footer={
              <>
                <ModalClose className={buttonVariants({ variant: "outline" })}>
                  Zurück
                </ModalClose>
                <Button
                  variant="primary"
                  onClick={handleCancel}
                  loading={isPending}
                >
                  Ja, absagen
                </Button>
              </>
            }
          >
            Der Termin wird als abgesagt markiert. Das lässt sich nicht
            rückgängig machen.
          </ModalContent>
        </Modal>
      ) : null}

      {error ? (
        <p role="alert" className="text-danger mt-2 text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
