"use client";

import * as React from "react";
import { CalendarX } from "lucide-react";

import { CalendarMonth } from "@/components/booking/calendar-month";
import { SlotList } from "@/components/booking/slot-list";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Modal, ModalContent } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatBerlin } from "@/lib/time";
import type { Slot } from "@/lib/availability";

export type ConfirmResult = { ok: true } | { ok: false; error: string };

export interface SlotPickerProps {
  onConfirm: (input: {
    startsAt: string;
    message?: string;
  }) => Promise<ConfirmResult>;
  submitLabel?: string;
  showMessageField?: boolean;
}

export function SlotPicker({
  onConfirm,
  submitLabel = "Termin buchen",
  showMessageField = true,
}: SlotPickerProps) {
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);
  const [availability, setAvailability] = React.useState<
    Record<string, Slot[]>
  >({});
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = React.useState<Slot | null>(null);
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const loadAvailability = React.useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch("/api/availability");
      if (!response.ok) throw new Error("request failed");
      const body = await response.json();
      setAvailability(body.availability ?? {});
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const availableDates = React.useMemo(
    () => new Set(Object.keys(availability)),
    [availability]
  );

  React.useEffect(() => {
    if (!selectedDate && availableDates.size > 0) {
      setSelectedDate(Array.from(availableDates).sort()[0]);
    }
  }, [availableDates, selectedDate]);

  const daySlots = selectedDate ? (availability[selectedDate] ?? []) : [];
  const durationMinutes = selectedSlot
    ? Math.round(
        (new Date(selectedSlot.end).getTime() -
          new Date(selectedSlot.start).getTime()) /
          60_000
      )
    : 0;

  async function handleConfirm() {
    if (!selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);

    const result = await onConfirm({
      startsAt: selectedSlot.start,
      message: message.trim() || undefined,
    });

    setSubmitting(false);
    if (!result.ok) {
      setSubmitError(result.error);
      if (result.error.includes("vergeben")) {
        setSelectedSlot(null);
        loadAvailability();
      }
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (loadError) {
    return (
      <ErrorState
        title="Termine konnten nicht geladen werden"
        description="Die Verbindung zur Datenbank ist fehlgeschlagen. Bitte lade die Seite neu."
        action={
          <Button variant="outline" onClick={loadAvailability}>
            Erneut versuchen
          </Button>
        }
      />
    );
  }

  if (availableDates.size === 0) {
    return (
      <EmptyState
        icon={CalendarX}
        title="Aktuell keine freien Termine"
        description="Schau in Kürze noch einmal vorbei."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <CalendarMonth
          availableDates={availableDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        <div className="flex flex-col gap-3">
          <h3 className="text-ink text-[16px] font-semibold">
            {selectedDate
              ? formatBerlin(`${selectedDate}T12:00:00Z`, {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })
              : "Wähle einen Tag"}
          </h3>
          <SlotList
            slots={daySlots}
            selectedStart={selectedSlot?.start ?? null}
            onSelectSlot={setSelectedSlot}
          />
        </div>
      </div>

      <p className="text-ink-muted text-[13px]">
        Alle Zeiten in deutscher Zeit.
      </p>

      <Modal
        open={Boolean(selectedSlot)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSlot(null);
            setSubmitError(null);
          }
        }}
      >
        {selectedSlot ? (
          <ModalContent
            title="Termin bestätigen"
            footer={
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSlot(null)}
                  disabled={submitting}
                >
                  Abbrechen
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirm}
                  loading={submitting}
                >
                  {submitLabel}
                </Button>
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-ink text-[15px] font-medium">
                  {formatBerlin(selectedSlot.start, {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  Uhr
                </p>
                <p className="text-ink-muted text-[14px]">
                  {durationMinutes} Minuten, online
                </p>
              </div>

              {showMessageField ? (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="booking-message"
                    className="text-ink text-[14px] font-medium"
                  >
                    Worum geht&apos;s konkret? (optional)
                  </label>
                  <Textarea
                    id="booking-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={3}
                  />
                </div>
              ) : null}

              {submitError ? (
                <p className="text-danger text-[14px]">{submitError}</p>
              ) : null}
            </div>
          </ModalContent>
        ) : null}
      </Modal>
    </div>
  );
}
