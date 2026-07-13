"use client";

import * as React from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Trash2, Video as VideoIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { parseVideoEmbed } from "@/lib/video-embed";

export function VideoNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const url = (node.attrs.url as string | null) ?? "";
  const [draft, setDraft] = React.useState(url);
  const embed = parseVideoEmbed(url);

  React.useEffect(() => setDraft(url), [url]);

  return (
    <NodeViewWrapper className="my-4" data-drag-handle>
      <div
        className={cn(
          "flex flex-col gap-2 rounded-xl outline-none",
          selected && "ring-accent ring-2 ring-offset-2 rounded-[20px]"
        )}
      >
        {embed ? (
          <div className="bg-surface-alt aspect-video w-full overflow-hidden rounded-[20px]">
            <iframe
              src={embed.embedUrl}
              className="h-full w-full"
              sandbox="allow-scripts allow-same-origin allow-presentation"
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
              title="Video-Einbettung"
            />
          </div>
        ) : (
          <div className="bg-surface-alt text-ink-muted flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-[20px] p-6 text-center text-[14px]">
            <VideoIcon className="size-6" aria-hidden="true" />
            {url
              ? "Diese URL wird nicht erkannt. Nur YouTube- und Vimeo-Links werden unterstützt."
              : "Füge einen YouTube- oder Vimeo-Link ein."}
          </div>
        )}

        <div
          contentEditable={false}
          className="border-line bg-surface shadow-card flex items-center gap-2 rounded-lg border p-2"
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => updateAttributes({ url: draft.trim() })}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                updateAttributes({ url: draft.trim() });
              }
            }}
            placeholder="https://youtube.com/watch?v=… oder https://vimeo.com/…"
            className="text-ink placeholder:text-ink-muted flex-1 bg-transparent text-[14px] outline-none"
          />
          <button
            type="button"
            aria-label="Video entfernen"
            onClick={() => deleteNode()}
            className="text-danger hover:bg-danger-soft flex size-8 shrink-0 items-center justify-center rounded"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
