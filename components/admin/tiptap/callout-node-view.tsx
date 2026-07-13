"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { AlertTriangle, CheckCircle2, Info, Trash2 } from "lucide-react";

import { calloutClasses, type CalloutVariant } from "@/lib/callout-style";
import { cn } from "@/lib/utils";

const VARIANT_OPTIONS: {
  value: CalloutVariant;
  label: string;
  icon: typeof Info;
}[] = [
  { value: "info", label: "Info", icon: Info },
  { value: "warning", label: "Warnung", icon: AlertTriangle },
  { value: "success", label: "Erfolg", icon: CheckCircle2 },
];

export function CalloutNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const variant = (node.attrs.variant as CalloutVariant | null) ?? "info";
  const title = (node.attrs.title as string | null) ?? "";
  const text = (node.attrs.text as string | null) ?? "";
  const { box, icon } = calloutClasses(variant);
  const Icon = VARIANT_OPTIONS.find((o) => o.value === variant)?.icon ?? Info;

  return (
    <NodeViewWrapper className="my-4" data-drag-handle>
      <div
        className={cn(
          "flex flex-col gap-2 rounded-xl p-4 outline-none",
          box,
          selected && "ring-accent ring-2 ring-offset-2"
        )}
      >
        <div className="flex items-start gap-2.5">
          <Icon className={cn("mt-0.5 size-5 shrink-0", icon)} aria-hidden="true" />
          <div className="flex flex-1 flex-col gap-1">
            <input
              value={title}
              onChange={(event) =>
                updateAttributes({ title: event.target.value })
              }
              placeholder="Titel (optional)"
              className="text-ink placeholder:text-ink-muted w-full bg-transparent text-[15px] font-semibold outline-none"
            />
            <textarea
              value={text}
              onChange={(event) =>
                updateAttributes({ text: event.target.value })
              }
              placeholder="Text der Hinweisbox…"
              rows={2}
              className="text-ink-soft placeholder:text-ink-muted w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none"
            />
          </div>
        </div>

        {selected ? (
          <div
            contentEditable={false}
            className="border-line bg-surface shadow-float flex w-fit items-center gap-1 rounded-lg border p-1.5"
          >
            {VARIANT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-label={option.label}
                onClick={() => updateAttributes({ variant: option.value })}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2 py-1 text-[12px] font-medium",
                  variant === option.value
                    ? "bg-accent-soft text-accent"
                    : "text-ink-soft hover:bg-surface-alt"
                )}
              >
                <option.icon className="size-3.5" aria-hidden="true" />
                {option.label}
              </button>
            ))}
            <span className="bg-line mx-1 h-5 w-px" aria-hidden="true" />
            <button
              type="button"
              aria-label="Hinweisbox entfernen"
              onClick={() => deleteNode()}
              className="text-danger hover:bg-danger-soft flex size-7 items-center justify-center rounded"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </NodeViewWrapper>
  );
}
