import type { JSONContent } from "@tiptap/react";

const text = (value: string): JSONContent => ({ type: "text", text: value });

export const doc = (...content: JSONContent[]): JSONContent => ({ type: "doc", content });

export const heading = (level: 1 | 2 | 3, value: string): JSONContent => ({
  type: "heading",
  attrs: { level },
  content: [text(value)],
});

export const paragraph = (value?: string): JSONContent =>
  value ? { type: "paragraph", content: [text(value)] } : { type: "paragraph" };

const listItems = (items: string[]): JSONContent[] =>
  items.map((item) => ({ type: "listItem", content: [paragraph(item)] }));

export const bulletList = (...items: string[]): JSONContent => ({
  type: "bulletList",
  content: listItems(items),
});

export const orderedList = (...items: string[]): JSONContent => ({
  type: "orderedList",
  content: listItems(items),
});

export const quote = (value: string): JSONContent => ({
  type: "blockquote",
  content: [paragraph(value)],
});

export const divider = (): JSONContent => ({ type: "horizontalRule" });

/** The section headings of a document, used for template previews. */
export function getHeadings(content: JSONContent): string[] {
  return (content.content ?? [])
    .filter((node) => node.type === "heading")
    .map((node) => node.content?.map((child) => child.text ?? "").join("") ?? "");
}
