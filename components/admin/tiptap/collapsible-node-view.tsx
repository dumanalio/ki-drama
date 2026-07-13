"use client";

import {
  NodeViewContent,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react";
import { ChevronsUpDown, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function CollapsibleNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const title = (node.attrs.title as string | null) ?? "";

  return (
    <NodeViewWrapper className="my-4" data-drag-handle>
      <div
        className={cn(
          "border-line bg-surface rounded-xl border p-4 outline-none",
          selected && "ring-accent ring-2 ring-offset-2"
        )}
      >
        <div className="flex items-center gap-2">
          <ChevronsUpDown
            className="text-ink-muted size-4 shrink-0"
            aria-hidden="true"
          />
          <input
            value={title}
            onChange={(event) =>
              updateAttributes({ title: event.target.value })
            }
            placeholder="Frage / Abschnittstitel"
            className="text-ink placeholder:text-ink-muted flex-1 bg-transparent text-[16px] font-semibold outline-none"
          />
          {selected ? (
            <button
              type="button"
              aria-label="Abschnitt entfernen"
              onClick={() => deleteNode()}
              className="text-danger hover:bg-danger-soft flex size-8 shrink-0 items-center justify-center rounded"
              contentEditable={false}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="border-line mt-3 flex flex-col gap-4 border-t pt-3">
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
