"use client";

import * as React from "react";
import { EditorContent, type Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
} from "lucide-react";

import { MediaPickerModal } from "@/components/admin/medien/media-picker-modal";
import { cn } from "@/lib/utils";

function ToolbarButton({
  active,
  disabled,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "text-ink-soft hover:bg-surface-alt hover:text-ink flex size-9 items-center justify-center rounded-lg transition-colors duration-[120ms] outline-none",
        "focus-visible:ring-accent focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-40",
        active && "bg-accent-soft text-accent"
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="bg-line mx-1 h-6 w-px" aria-hidden="true" />;
}

export function RichTextEditor({ editor }: { editor: Editor | null }) {
  const [pickerOpen, setPickerOpen] = React.useState(false);

  if (!editor) return null;

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link-URL:", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="border-line bg-surface overflow-hidden rounded-xl border">
      <div className="border-line bg-surface-alt flex flex-wrap items-center gap-1 border-b p-2">
        <ToolbarButton
          label="Überschrift 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Überschrift 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="size-4" aria-hidden="true" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Fett"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Kursiv"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" aria-hidden="true" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Aufzählung"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Nummerierte Liste"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Zitat"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" aria-hidden="true" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Link"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <LinkIcon className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Bild aus der Medienbibliothek"
          onClick={() => setPickerOpen(true)}
        >
          <ImageIcon className="size-4" aria-hidden="true" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Trenner"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Code"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="size-4" aria-hidden="true" />
        </ToolbarButton>
      </div>

      <div className="px-5 py-4">
        <EditorContent editor={editor} />
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(media) => {
          editor
            .chain()
            .focus()
            .setImage({
              src: media.url,
              alt: media.alt,
              width: media.width ?? undefined,
              height: media.height ?? undefined,
            })
            .run();
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
