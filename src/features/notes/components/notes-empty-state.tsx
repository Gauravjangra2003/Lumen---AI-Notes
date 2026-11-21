"use client";

import { useRouter } from "next/navigation";
import { FilePlus2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useCreateNote } from "../hooks/use-notes";

export function NotesEmptyState() {
  const router = useRouter();
  const createNote = useCreateNote();

  return (
    <div className="flex flex-col items-center gap-4 py-32 text-center">
      <FilePlus2 className="size-10 text-muted-foreground" />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Pick a note or start a new one</h1>
        <p className="text-sm text-muted-foreground">Your notes are saved automatically.</p>
      </div>
      <Button
        onClick={() =>
          createNote.mutate(undefined, {
            onSuccess: (note) => router.push(`/notes/${note.id}`),
          })
        }
        disabled={createNote.isPending}
      >
        {createNote.isPending && <Loader2 className="animate-spin" />}
        New note
      </Button>
    </div>
  );
}
