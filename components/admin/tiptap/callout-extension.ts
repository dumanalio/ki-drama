import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { CalloutNodeView } from "@/components/admin/tiptap/callout-node-view";
import type { CalloutVariant } from "@/lib/callout-style";

export type { CalloutVariant };

/**
 * Attribute-only-Node (kein editierbarer Rich-Content darunter) für die
 * Hinweisbox -- Titel und Text sind einfache Strings, bearbeitet über die
 * NodeView, genau wie die Bildunterschrift bei EditableImage.
 */
export const Callout = Node.create({
  name: "callout",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      variant: { default: "info" as CalloutVariant },
      title: { default: "" },
      text: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "callout" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView);
  },
});
