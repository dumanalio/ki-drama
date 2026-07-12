"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

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
      Image,
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
