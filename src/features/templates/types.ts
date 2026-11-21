import type { JSONContent } from "@tiptap/react";

export type NoteTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Gradient classes for the template's preview card. */
  gradientClassName: string;
  content: JSONContent;
};
