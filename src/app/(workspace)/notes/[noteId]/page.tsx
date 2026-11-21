import { Suspense } from "react";

import { ActiveNoteEditor, NoteEditorSkeleton } from "@/features/notes";

export default function NotePage() {
  return (
    <Suspense fallback={<NoteEditorSkeleton />}>
      <ActiveNoteEditor />
    </Suspense>
  );
}
