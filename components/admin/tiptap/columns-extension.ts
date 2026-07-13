import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Reine Schema-Nodes ohne React-NodeView: Der Inhalt jeder Spalte ist ganz
 * normaler editierbarer Rich-Text (block+), ProseMirror rendert das direkt
 * über renderHTML -- kein NodeView nötig, weil kein Attribut-Input darunter
 * liegt (anders als bei Callout/Video/Collapsible).
 */
export const Column = Node.create({
  name: "column",
  content: "block+",
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "column" }),
      0,
    ];
  },
});

export const Columns = Node.create({
  name: "columns",
  group: "block",
  content: "column column",
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "columns" }),
      0,
    ];
  },
});

export function insertColumnsContent() {
  return {
    type: "columns",
    content: [
      { type: "column", content: [{ type: "paragraph" }] },
      { type: "column", content: [{ type: "paragraph" }] },
    ],
  };
}
