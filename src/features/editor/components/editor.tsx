"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import { Placeholder } from "@tiptap/extensions";

import { documentExtensions } from "../extensions";
import { EditorToolbar } from "./editor-toolbar";

export type EditorChange = {
  content: JSONContent;
  plainText: string;
};

type EditorProps = {
  initialContent: JSONContent | null;
  onChange: (change: EditorChange) => void;
};

export function Editor({ initialContent, onChange }: EditorProps) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      ...documentExtensions,
      Placeholder.configure({ placeholder: "Start writing, or type # for a heading…" }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-content min-h-[50vh] focus:outline-none",
        "aria-label": "Note content",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChangeRef.current({ content: current.getJSON(), plainText: current.getText() });
    },
  });

  if (!editor) return null;

  return (
    <div className="space-y-4">
      <div className="sticky top-12 z-10 bg-background/80 py-2 backdrop-blur md:top-0">
        <EditorToolbar editor={editor} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
