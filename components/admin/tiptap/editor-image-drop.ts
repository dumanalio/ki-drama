import type { EditorView } from "@tiptap/pm/view";
import { toast } from "sonner";

import { createMediaRecord, discardUploadedFile } from "@/lib/actions/media";
import { compressImageFile, uploadFileWithProgress } from "@/lib/media-client";

/**
 * Bild per Drag & Drop direkt in den Editor: laedt hoch, fragt Alt-Text ab
 * (Pflichtfeld, siehe CLAUDE.md) und fuegt erst danach den Bild-Node ein.
 * Bricht der Nutzer die Alt-Text-Abfrage ab, wird die hochgeladene Datei
 * wieder entfernt statt als Karteileiche im Storage liegen zu bleiben.
 */
export async function handleEditorImageDrop(
  view: EditorView,
  file: File,
  pos: number
): Promise<void> {
  let uploadedPath: string | undefined;

  try {
    const compressed = await compressImageFile(file);
    const uploaded = await uploadFileWithProgress(compressed.file, () => {});
    uploadedPath = uploaded.path;

    const alt = window.prompt(
      "Alt-Text für das Bild (Pflicht für Barrierefreiheit):",
      ""
    );
    if (!alt || alt.trim().length === 0) {
      await discardUploadedFile(uploaded.path);
      toast.error("Ohne Alt-Text wird das Bild nicht eingefügt.");
      return;
    }

    const result = await createMediaRecord({
      path: uploaded.path,
      url: uploaded.url,
      alt: alt.trim(),
      caption: null,
      width: compressed.width,
      height: compressed.height,
      bytes: compressed.file.size,
    });

    if (!result.ok) {
      await discardUploadedFile(uploaded.path);
      toast.error(result.error);
      return;
    }

    const imageType = view.state.schema.nodes.image;
    if (!imageType) return;

    const node = imageType.create({
      src: uploaded.url,
      alt: alt.trim(),
      width: compressed.width,
      height: compressed.height,
      sizePreset: "full",
      align: "center",
      caption: null,
    });

    const insertPos = Math.min(pos, view.state.doc.content.size);
    view.dispatch(view.state.tr.insert(insertPos, node));
    toast.success("Bild eingefügt");
  } catch (error) {
    if (uploadedPath) await discardUploadedFile(uploadedPath);
    toast.error(
      error instanceof Error
        ? error.message
        : "Das Bild konnte nicht hochgeladen werden. Bitte versuche es erneut."
    );
  }
}
