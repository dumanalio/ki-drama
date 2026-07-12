"use client";

import * as React from "react";
import { CalendarX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cancelBooking, updateBookingStatus } from "@/lib/actions/bookings";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_VARIANTS } from "@/lib/labels";
import type { BookingWithLead } from "@/lib/queries/admin-termine";
import { formatBerlin } from "@/lib/time";

function BookingRow({ booking }: { booking: BookingWithLead }) {
  const [error, setError] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isCancelling, startCancel] = React.useTransition();
  const [isUpdating, startUpdate] = React.useTransition();
  const isPast = new Date(booking.startsAt).getTime() < Date.now();

  function handleCancel() {
    setError(null);
    startCancel(async () => {
      const result = await cancelBooking({ bookingId: booking.id });
      if (result.ok) {
        setConfirmOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  function handleStatusChange(value: string | null) {
    if (!value) return;
    setError(null);
    startUpdate(async () => {
      const result = await updateBookingStatus({
        bookingId: booking.id,
        status: value,
      });
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <li className="border-line flex flex-col gap-3 border-b py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-ink text-[15px] font-medium">{booking.leadName}</p>
        <p className="text-ink-muted text-[13px]">{booking.leadEmail}</p>
        <p className="text-ink-soft mt-1 text-[14px]">
          {formatBerlin(booking.startsAt, {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          Uhr
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={BOOKING_STATUS_VARIANTS[booking.status]}>
          {BOOKING_STATUS_LABELS[booking.status]}
        </Badge>

        {booking.status === "gebucht" && isPast ? (
          <Select onValueChange={handleStatusChange} disabled={isUpdating}>
            <SelectTrigger className="w-[180px]" aria-label="Status setzen">
              <SelectValue placeholder="Status setzen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wahrgenommen">Wahrgenommen</SelectItem>
              <SelectItem value="nicht_erschienen">Nicht erschienen</SelectItem>
            </SelectContent>
          </Select>
        ) : null}

        {booking.status === "gebucht" && !isPast ? (
          <Modal open={confirmOpen} onOpenChange={setConfirmOpen}>
            <ModalTrigger
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Absagen
            </ModalTrigger>
            <ModalContent
              title="Termin absagen?"
              footer={
                <>
                  <ModalClose
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Zurück
                  </ModalClose>
                  <Button
                    variant="primary"
                    onClick={handleCancel}
                    loading={isCancelling}
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
      </div>

      {error ? (
        <p role="alert" className="text-danger w-full text-[13px]">
          {error}
        </p>
      ) : null}
    </li>
  );
}

export function BookingList({ bookings }: { bookings: BookingWithLead[] }) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={CalendarX}
        title="Noch keine Buchungen"
        description="Sobald jemand einen Termin bucht, erscheint er hier."
      />
    );
  }

  const now = Date.now();
  const upcoming = bookings
    .filter((booking) => new Date(booking.startsAt).getTime() >= now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = bookings.filter(
    (booking) => new Date(booking.startsAt).getTime() < now
  );

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-ink mb-1 text-[16px] font-semibold">Kommend</h2>
        {upcoming.length === 0 ? (
          <p className="text-ink-muted text-[14px]">
            Keine anstehenden Termine.
          </p>
        ) : (
          <ul>
            {upcoming.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-ink mb-1 text-[16px] font-semibold">Vergangen</h2>
        {past.length === 0 ? (
          <p className="text-ink-muted text-[14px]">
            Noch keine vergangenen Termine.
          </p>
        ) : (
          <ul>
            {past.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
