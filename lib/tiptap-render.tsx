import * as React from "react";
import Image from "next/image";

import type { Json } from "@/types/database";

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
      return (
        <span
          key={key}
          className="bg-surface-alt block overflow-hidden rounded-[20px]"
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="h-auto w-full"
          />
        </span>
      );
    }

    case "horizontalRule":
      return <hr key={key} className="border-line" />;

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
