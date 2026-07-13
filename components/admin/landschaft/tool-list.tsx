"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SortableList } from "@/components/admin/sortable-list";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/modal";
import { deleteTool, reorderTools } from "@/lib/actions/tools";
import type { Tool } from "@/types/database";

function ToolRow({ tool }: { tool: Tool }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDeleting, startDeleting] = React.useTransition();

  function handleDelete() {
    setError(null);
    startDeleting(async () => {
      const result = await deleteTool(tool.id);
      setConfirmOpen(false);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Tool gelöscht");
        router.refresh();
      }
    });
  }

  return (
    <div className="border-line bg-surface flex items-center justify-between gap-4 rounded-xl border p-4">
      <div className="min-w-0">
        <Link
          href={`/admin/landschaft/${tool.id}`}
          className="text-ink hover:text-accent focus-visible:ring-accent truncate rounded font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {tool.name || "Ohne Namen"}
        </Link>
        <p className="text-ink-muted truncate text-[13px]">{tool.category}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={tool.status === "veroeffentlicht" ? "success" : "soft"}>
          {tool.status === "veroeffentlicht" ? "Veröffentlicht" : "Entwurf"}
        </Badge>
        <Modal open={confirmOpen} onOpenChange={setConfirmOpen}>
          <ModalTrigger
            className={buttonVariants({ variant: "outline", size: "sm" })}
            aria-label="Tool löschen"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </ModalTrigger>
          <ModalContent
            title="Tool löschen?"
            footer={
              <>
                <ModalClose className={buttonVariants({ variant: "outline" })}>
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
            {tool.name || "Dieses Tool"} wird endgültig gelöscht. Das lässt sich
            nicht rückgängig machen.
          </ModalContent>
        </Modal>
      </div>
      {error ? (
        <p role="alert" className="text-danger text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ToolList({ tools }: { tools: Tool[] }) {
  const [items, setItems] = React.useState(tools);

  React.useEffect(() => {
    setItems(tools);
  }, [tools]);

  function handleReorder(next: Tool[]) {
    setItems(next);
    reorderTools(next.map((item) => item.id)).then((result) => {
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <SortableList
      items={items}
      onReorder={handleReorder}
      renderItem={(tool) => <ToolRow tool={tool} />}
    />
  );
}
