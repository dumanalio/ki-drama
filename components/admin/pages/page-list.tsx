"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/modal";
import { deletePage } from "@/lib/actions/pages";
import { formatBerlin } from "@/lib/time";
import type { Page } from "@/types/database";

const STATUS_LABELS: Record<Page["status"], string> = {
  entwurf: "Entwurf",
  veroeffentlicht: "Veröffentlicht",
};

function PageRow({ page }: { page: Page }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDeleting, startDeleting] = React.useTransition();

  function handleDelete() {
    setError(null);
    startDeleting(async () => {
      const result = await deletePage(page.id);
      if (result.ok) {
        setConfirmOpen(false);
        toast.success("Seite gelöscht");
        router.refresh();
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    });
  }

  return (
    <tr className="border-line border-b last:border-b-0">
      <td className="px-4 py-3">
        <Link
          href={`/admin/seiten/${page.id}`}
          className="text-ink hover:text-accent focus-visible:ring-accent rounded font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {page.title || "Ohne Titel"}
        </Link>
      </td>
      <td className="px-4 py-3">
        <span className="text-ink-soft text-[14px]">/{page.slug}</span>
      </td>
      <td className="px-4 py-3">
        <Badge variant={page.status === "veroeffentlicht" ? "success" : "soft"}>
          {STATUS_LABELS[page.status]}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <span className="text-ink-soft text-[14px]">
          {formatBerlin(page.updated_at, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/seiten/${page.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Bearbeiten
          </Link>
          <Modal open={confirmOpen} onOpenChange={setConfirmOpen}>
            <ModalTrigger
              className={buttonVariants({ variant: "outline", size: "sm" })}
              aria-label="Seite löschen"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </ModalTrigger>
            <ModalContent
              title="Seite löschen?"
              footer={
                <>
                  <ModalClose
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Zurück
                  </ModalClose>
                  <Button
                    variant="primary"
                    onClick={handleDelete}
                    loading={isDeleting}
                  >
                    Ja, löschen
                  </Button>
                </>
              }
            >
              Diese Seite wird endgültig gelöscht. Navigationspunkte, die
              darauf verweisen, führen danach ins Leere. Das lässt sich nicht
              rückgängig machen.
            </ModalContent>
          </Modal>
        </div>
        {error ? (
          <p role="alert" className="text-danger mt-1.5 text-[13px]">
            {error}
          </p>
        ) : null}
      </td>
    </tr>
  );
}

export function PageList({ pages }: { pages: Page[] }) {
  return (
    <div className="border-line overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-left text-[14px]">
        <thead>
          <tr className="border-line bg-surface-alt border-b">
            <th className="text-ink-muted px-4 py-3 text-[13px] font-medium">
              Titel
            </th>
            <th className="text-ink-muted px-4 py-3 text-[13px] font-medium">
              Slug
            </th>
            <th className="text-ink-muted px-4 py-3 text-[13px] font-medium">
              Status
            </th>
            <th className="text-ink-muted px-4 py-3 text-[13px] font-medium">
              Zuletzt geändert
            </th>
            <th className="text-ink-muted px-4 py-3 text-[13px] font-medium">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <PageRow key={page.id} page={page} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
