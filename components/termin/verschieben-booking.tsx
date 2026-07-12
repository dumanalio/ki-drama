"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  SlotPicker,
  type ConfirmResult,
} from "@/components/booking/slot-picker";

export function VerschiebenBooking({ token }: { token: string }) {
  const router = useRouter();

  async function handleConfirm({
    startsAt,
  }: {
    startsAt: string;
  }): Promise<ConfirmResult> {
    try {
      const response = await fetch(`/api/termin/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startsAt }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        return {
          ok: false,
          error:
            body.error ??
            "Der Termin konnte nicht verschoben werden. Bitte versuche es erneut.",
        };
      }

      router.push(`/termin/${token}`);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error:
          "Der Termin konnte nicht verschoben werden. Prüfe deine Verbindung.",
      };
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-[900px] flex-1 flex-col px-6 py-10">
        <div className="mb-8">
          <Link
            href={`/termin/${token}`}
            aria-label="Zurück"
            className="text-ink-muted hover:text-ink flex size-10 items-center justify-center rounded-lg transition-colors duration-[120ms]"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-ink text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
            Neuen Termin wählen
          </h1>
          <p className="text-ink-soft text-[15px]">
            Dein bisheriger Termin bleibt bestehen, bis du einen neuen
            bestätigst.
          </p>
        </div>

        <SlotPicker
          onConfirm={handleConfirm}
          submitLabel="Termin verschieben"
          showMessageField={false}
        />
      </div>
    </div>
  );
}
