"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { Callout } from "@/components/admin/tiptap/callout-extension";
import { Collapsible } from "@/components/admin/tiptap/collapsible-extension";
import { Column, Columns } from "@/components/admin/tiptap/columns-extension";
import { EditableImage } from "@/components/admin/tiptap/image-extension";
import { Video } from "@/components/admin/tiptap/video-extension";
import type { Json } from "@/types/database";

export function useContentEditor({
  content,
  onUpdate,
  placeholder,
}: {
  content: Json;
  onUpdate: (json: Json) => void;
  placeholder?: string;
}) {
  return useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      EditableImage,
      Callout,
      Video,
      Columns,
      Column,
      Collapsible,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: placeholder ?? "Schreib deinen Text…",
      }),
    ],
    content: content as object,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-content min-h-[400px] outline-none",
      },
    },
    onUpdate: ({ editor }) => onUpdate(editor.getJSON() as Json),
  });
}
