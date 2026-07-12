"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  SlotPicker,
  type ConfirmResult,
} from "@/components/booking/slot-picker";

export function TerminBooking({ sessionId }: { sessionId: string }) {
  const router = useRouter();

  async function handleConfirm({
    startsAt,
    message,
  }: {
    startsAt: string;
    message?: string;
  }): Promise<ConfirmResult> {
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, startsAt, message }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        return {
          ok: false,
          error:
            body.error ??
            "Der Termin konnte nicht gebucht werden. Bitte versuche es erneut.",
        };
      }

      const body = await response.json();
      router.push(`/check/danke?token=${body.manageToken}`);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error:
          "Der Termin konnte nicht gebucht werden. Prüfe deine Verbindung und versuche es erneut.",
      };
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-[900px] flex-1 flex-col px-6 py-10">
        <div className="mb-8">
          <Link
            href="/check"
            aria-label="Zurück"
            className="text-ink-muted hover:text-ink flex size-10 items-center justify-center rounded-lg transition-colors duration-[120ms]"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-ink text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
            Wähle deinen Termin
          </h1>
          <p className="text-ink-soft text-[15px]">
            Ein kurzes Gespräch, online.
          </p>
        </div>

        <SlotPicker onConfirm={handleConfirm} submitLabel="Termin buchen" />
      </div>
    </div>
  );
}
