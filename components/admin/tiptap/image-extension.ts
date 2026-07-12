import TiptapImage from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { ImageNodeView } from "@/components/admin/tiptap/image-node-view";

export type ImageSizePreset = "small" | "medium" | "full";
export type ImageAlign = "left" | "center" | "right";

/**
 * Erweitert das Standard-Image-Node um Attribute für Breite, Ausrichtung und
 * Bildunterschrift sowie eine React-NodeView mit einer Bearbeitungsleiste.
 * lib/tiptap-render.tsx gibt dieselben Attribute für die Veröffentlichung aus.
 */
export const EditableImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      height: { default: null },
      sizePreset: { default: "full" },
      align: { default: "center" },
      caption: { default: null },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
