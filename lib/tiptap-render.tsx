import * as React from "react";
import Image from "next/image";
import { AlertTriangle, CheckCircle2, ChevronDown, Info } from "lucide-react";

import { calloutClasses, type CalloutVariant } from "@/lib/callout-style";
import {
  isVideoPath,
  videoPlaybackAttrs,
  type VideoPlaybackMode,
} from "@/lib/media-constants";
import { parseVideoEmbed } from "@/lib/video-embed";
import type { Json } from "@/types/database";

const CALLOUT_ICONS: Record<CalloutVariant, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
};

interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: TiptapMark[];
}

function getDocNodes(value: Json): TiptapNode[] {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    (value as { type?: unknown }).type !== "doc"
  ) {
    return [];
  }

  const content = (value as { content?: unknown }).content;
  return Array.isArray(content) ? (content as TiptapNode[]) : [];
}

function applyMarks(text: string, marks?: TiptapMark[]): React.ReactNode {
  if (!marks || marks.length === 0) return text;

  return marks.reduce<React.ReactNode>((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{acc}</strong>;
      case "italic":
        return <em>{acc}</em>;
      case "code":
        return (
          <code className="bg-surface-alt text-ink rounded px-1.5 py-0.5 text-[0.9em]">
            {acc}
          </code>
        );
      case "link": {
        const href =
          typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
        const external = /^https?:\/\//.test(href);
        return (
          <a
            href={href}
            className="text-accent hover:text-accent-hover underline underline-offset-2"
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            {acc}
          </a>
        );
      }
      default:
        return acc;
    }
  }, text);
}

function renderInline(nodes: TiptapNode[] | undefined): React.ReactNode {
  if (!nodes) return null;

  return nodes.map((node, index) => {
    if (node.type === "text") {
      return (
        <React.Fragment key={index}>
          {applyMarks(node.text ?? "", node.marks)}
        </React.Fragment>
      );
    }
    if (node.type === "hardBreak") {
      return <br key={index} />;
    }
    return null;
  });
}

function renderListItem(node: TiptapNode, key: React.Key): React.ReactNode {
  return (
    <li key={key}>
      {node.content?.map((child, index) =>
        child.type === "paragraph" ? (
          <React.Fragment key={index}>
            {renderInline(child.content)}
          </React.Fragment>
        ) : (
          renderNode(child, index)
        )
      )}
    </li>
  );
}

function renderNode(node: TiptapNode, key: React.Key): React.ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} className="text-ink-soft text-[17px] leading-relaxed">
          {renderInline(node.content)}
        </p>
      );

    case "heading": {
      const level = Number(node.attrs?.level) || 2;
      const content = renderInline(node.content);
      if (level <= 2) {
        return (
          <h2
            key={key}
            className="text-ink mt-10 text-[26px] font-bold tracking-[-0.015em] first:mt-0"
          >
            {content}
          </h2>
        );
      }
      return (
        <h3
          key={key}
          className="text-ink mt-8 text-[20px] font-semibold tracking-[-0.01em]"
        >
          {content}
        </h3>
      );
    }

    case "bulletList":
      return (
        <ul
          key={key}
          className="text-ink-soft list-disc space-y-2 pl-6 text-[17px] leading-relaxed"
        >
          {node.content?.map((item, index) => renderListItem(item, index))}
        </ul>
      );

    case "orderedList":
      return (
        <ol
          key={key}
          className="text-ink-soft list-decimal space-y-2 pl-6 text-[17px] leading-relaxed"
        >
          {node.content?.map((item, index) => renderListItem(item, index))}
        </ol>
      );

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-line-strong text-ink-soft border-l-2 pl-4 text-[17px] leading-relaxed italic"
        >
          {node.content?.map((child, index) => renderNode(child, index))}
        </blockquote>
      );

    case "codeBlock": {
      const text =
        node.content?.map((textNode) => textNode.text ?? "").join("") ?? "";
      return (
        <pre
          key={key}
          className="bg-surface-alt text-ink overflow-x-auto rounded-xl p-4 text-[14px] leading-relaxed"
        >
          <code>{text}</code>
        </pre>
      );
    }

    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : null;
      if (!src) return null;
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      const width = Number(node.attrs?.width) || 1200;
      const height = Number(node.attrs?.height) || 675;
      const sizePreset =
        typeof node.attrs?.sizePreset === "string"
          ? node.attrs.sizePreset
          : "full";
      const align =
        typeof node.attrs?.align === "string" ? node.attrs.align : "center";
      const caption =
        typeof node.attrs?.caption === "string" && node.attrs.caption.length > 0
          ? node.attrs.caption
          : null;

      const widthClass =
        sizePreset === "small"
          ? "max-w-[280px]"
          : sizePreset === "medium"
            ? "max-w-[480px]"
            : "max-w-full";
      const alignClass =
        align === "left"
          ? "mr-auto"
          : align === "right"
            ? "ml-auto"
            : "mx-auto";

      return (
        <figure key={key} className={`${widthClass} ${alignClass}`}>
          <span className="bg-surface-alt block overflow-hidden rounded-[20px]">
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className="h-auto w-full"
            />
          </span>
          {caption ? (
            <figcaption className="text-ink-muted mt-2 text-center text-[13px]">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    case "horizontalRule":
      return <hr key={key} className="border-line" />;

    case "callout": {
      const variant =
        typeof node.attrs?.variant === "string"
          ? (node.attrs.variant as CalloutVariant)
          : "info";
      const title =
        typeof node.attrs?.title === "string" ? node.attrs.title : "";
      const text =
        typeof node.attrs?.text === "string" ? node.attrs.text : "";
      if (!title && !text) return null;
      const { box, icon } = calloutClasses(variant);
      const Icon = CALLOUT_ICONS[variant];

      return (
        <div key={key} className={`flex items-start gap-2.5 rounded-xl p-4 ${box}`}>
          <Icon className={`mt-0.5 size-5 shrink-0 ${icon}`} aria-hidden="true" />
          <div className="flex flex-col gap-1">
            {title ? (
              <p className="text-ink text-[15px] font-semibold">{title}</p>
            ) : null}
            {text ? (
              <p className="text-ink-soft text-[15px] leading-relaxed whitespace-pre-line">
                {text}
              </p>
            ) : null}
          </div>
        </div>
      );
    }

    case "video": {
      const url = typeof node.attrs?.url === "string" ? node.attrs.url : "";
      const playbackMode: VideoPlaybackMode =
        node.attrs?.playbackMode === "auto" ? "auto" : "controls";

      if (isVideoPath(url)) {
        return (
          <div
            key={key}
            className="bg-surface-alt aspect-video w-full overflow-hidden rounded-[20px]"
          >
            {/* "auto": Autoplay+Loop, aber immer stumm -- Browser erlauben
                Autoplay ohnehin nur ohne Ton. "controls": kein Autoplay,
                Ton nur auf Klick über die Steuerleiste. */}
            <video
              src={url}
              {...videoPlaybackAttrs(playbackMode)}
              className="size-full object-contain"
            />
          </div>
        );
      }

      const embed = parseVideoEmbed(url);
      if (!embed) return null;

      return (
        <div
          key={key}
          className="bg-surface-alt aspect-video w-full overflow-hidden rounded-[20px]"
        >
          <iframe
            src={embed.embedUrl}
            className="h-full w-full"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
            title="Video-Einbettung"
          />
        </div>
      );
    }

    case "columns":
      return (
        <div key={key} className="grid gap-6 sm:grid-cols-2">
          {node.content?.map((column, index) => (
            <div key={index} className="flex min-w-0 flex-col gap-4">
              {column.content?.map((child, childIndex) =>
                renderNode(child, childIndex)
              )}
            </div>
          ))}
        </div>
      );

    case "collapsible": {
      const title =
        typeof node.attrs?.title === "string" ? node.attrs.title : "";
      return (
        <details
          key={key}
          className="border-line bg-surface group rounded-xl border p-4"
        >
          <summary className="text-ink flex cursor-pointer list-none items-center justify-between gap-2 text-[16px] font-semibold [&::-webkit-details-marker]:hidden">
            {title || "Mehr erfahren"}
            <ChevronDown
              className="text-ink-muted size-4 shrink-0 transition-transform duration-[120ms] group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div className="border-line mt-3 flex flex-col gap-4 border-t pt-3">
            {node.content?.map((child, index) => renderNode(child, index))}
          </div>
        </details>
      );
    }

    case "table":
      return (
        <div key={key} className="overflow-x-auto">
          <table className="border-line w-full border-collapse overflow-hidden rounded-xl border text-[15px]">
            <tbody>
              {node.content?.map((row, index) => renderNode(row, index))}
            </tbody>
          </table>
        </div>
      );

    case "tableRow":
      return (
        <tr key={key} className="border-line border-b last:border-b-0">
          {node.content?.map((cell, index) => renderNode(cell, index))}
        </tr>
      );

    case "tableHeader":
      return (
        <th
          key={key}
          className="bg-surface-alt text-ink border-line border-r p-3 text-left text-[14px] font-semibold last:border-r-0"
        >
          {node.content?.map((child, index) =>
            child.type === "paragraph" ? (
              <React.Fragment key={index}>
                {renderInline(child.content)}
              </React.Fragment>
            ) : (
              renderNode(child, index)
            )
          )}
        </th>
      );

    case "tableCell":
      return (
        <td
          key={key}
          className="text-ink-soft border-line border-r p-3 leading-relaxed last:border-r-0"
        >
          {node.content?.map((child, index) =>
            child.type === "paragraph" ? (
              <React.Fragment key={index}>
                {renderInline(child.content)}
              </React.Fragment>
            ) : (
              renderNode(child, index)
            )
          )}
        </td>
      );

    default:
      return null;
  }
}

export function TiptapRender({ doc }: { doc: Json }) {
  const nodes = getDocNodes(doc);

  return (
    <div className="flex flex-col gap-4">
      {nodes.map((node, index) => renderNode(node, index))}
    </div>
  );
}

function collectText(node: TiptapNode, acc: string[]): void {
  if (node.text) acc.push(node.text);
  node.content?.forEach((child) => collectText(child, acc));
}

export function estimateReadingMinutes(doc: Json): number {
  const nodes = getDocNodes(doc);
  if (nodes.length === 0) return 1;

  const words: string[] = [];
  nodes.forEach((node) => collectText(node, words));
  const wordCount = words.join(" ").split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.round(wordCount / 200));
}
