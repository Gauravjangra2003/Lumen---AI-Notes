"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { PrintableDocument } from "@/features/editor/lib/export-pdf";

import { notesKeys } from "../api/keys";
import { fetchNote } from "../api/notes";

export async function downloadPdf(document: PrintableDocument) {
  try {
    const { exportDocumentToPdf } = await import("@/features/editor/lib/export-pdf");
    await exportDocumentToPdf(document);
  } catch {
    toast.error("Couldn't create the PDF. Please try again.");
  }
}

/** Downloads any of the user's notes by id, using the cached copy when there is one. */
export function useDownloadNotePdf() {
  const queryClient = useQueryClient();

  return useCallback(
    async (noteId: string) => {
      const note = await queryClient
        .fetchQuery({
          queryKey: notesKeys.detail(noteId),
          queryFn: () => fetchNote(noteId),
          staleTime: Infinity,
        })
        .catch(() => null);
      if (!note) {
        toast.error("Couldn't load this note.");
        return;
      }
      await downloadPdf({
        title: note.title,
        content: note.content as PrintableDocument["content"],
      });
    },
    [queryClient],
  );
}
