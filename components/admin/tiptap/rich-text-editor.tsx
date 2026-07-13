"use client";

import * as React from "react";
import { EditorContent, type Editor } from "@tiptap/react";
import {
  Bold,
  ChevronsUpDown,
  Code,
  Columns2,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Info,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Table as TableIcon,
  Trash2,
  Video as VideoIcon,
} from "lucide-react";

import { insertColumnsContent } from "@/components/admin/tiptap/columns-extension";
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

        <ToolbarDivider />

        <ToolbarButton
          label="Hinweisbox einfügen"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: "callout",
                attrs: { variant: "info", title: "", text: "" },
              })
              .run()
          }
        >
          <Info className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Video einbetten (YouTube/Vimeo)"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({ type: "video", attrs: { url: "" } })
              .run()
          }
        >
          <VideoIcon className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Zwei-Spalten-Layout einfügen"
          onClick={() =>
            editor.chain().focus().insertContent(insertColumnsContent()).run()
          }
        >
          <Columns2 className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Ausklappbaren Abschnitt einfügen"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: "collapsible",
                attrs: { title: "" },
                content: [{ type: "paragraph" }],
              })
              .run()
          }
        >
          <ChevronsUpDown className="size-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Vergleichstabelle einfügen"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
              .run()
          }
        >
          <TableIcon className="size-4" aria-hidden="true" />
        </ToolbarButton>

        {editor.isActive("table") ? (
          <>
            <ToolbarDivider />
            <ToolbarButton
              label="Spalte einfügen"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              <span className="text-[13px] font-semibold">+Sp</span>
            </ToolbarButton>
            <ToolbarButton
              label="Spalte löschen"
              onClick={() => editor.chain().focus().deleteColumn().run()}
            >
              <span className="text-[13px] font-semibold">−Sp</span>
            </ToolbarButton>
            <ToolbarButton
              label="Zeile einfügen"
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              <span className="text-[13px] font-semibold">+Z</span>
            </ToolbarButton>
            <ToolbarButton
              label="Zeile löschen"
              onClick={() => editor.chain().focus().deleteRow().run()}
            >
              <span className="text-[13px] font-semibold">−Z</span>
            </ToolbarButton>
            <ToolbarButton
              label="Tabelle löschen"
              onClick={() => editor.chain().focus().deleteTable().run()}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </ToolbarButton>
          </>
        ) : null}
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
