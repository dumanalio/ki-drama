"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/modal";

export function TerminActions({ token }: { token: string }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleCancel() {
    setCancelling(true);
    setError(null);
    try {
      const response = await fetch(`/api/termin/${token}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(
          body.error ??
            "Der Termin konnte nicht abgesagt werden. Bitte versuche es erneut."
        );
        setCancelling(false);
        return;
      }
      setConfirmOpen(false);
      setCancelling(false);
      router.refresh();
    } catch {
      setError(
        "Der Termin konnte nicht abgesagt werden. Prüfe deine Verbindung."
      );
      setCancelling(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? <p className="text-danger text-[14px]">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          render={<Link href={`/termin/${token}/verschieben`} />}
        >
          Verschieben
        </Button>

        <Modal open={confirmOpen} onOpenChange={setConfirmOpen}>
          <ModalTrigger className={buttonVariants({ variant: "outline" })}>
            Absagen
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
                  loading={cancelling}
                >
                  Ja, absagen
                </Button>
              </>
            }
          >
            Der Termin wird storniert und der Slot wieder freigegeben. Das lässt
            sich nicht rückgängig machen.
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
