import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { CollapsibleNodeView } from "@/components/admin/tiptap/collapsible-node-view";

export const Collapsible = Node.create({
  name: "collapsible",
  group: "block",
  content: "block+",
  isolating: true,

  addAttributes() {
    return {
      title: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="collapsible"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "collapsible" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CollapsibleNodeView);
  },
});
