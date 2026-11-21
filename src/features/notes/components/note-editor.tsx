"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { Check, CloudAlert, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Editor, type EditorChange } from "@/features/editor/components/editor";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

import { useNote, useUpdateNote } from "../hooks/use-notes";
import type { Note, NoteUpdate } from "../types";

const AUTOSAVE_DELAY_MS = 800;

type SaveStatus = "saved" | "unsaved" | "saving" | "error";

export function ActiveNoteEditor() {
  const { noteId } = useParams<{ noteId: string }>();
  return <NoteEditor noteId={noteId} />;
}

export function NoteEditor({ noteId }: { noteId: string }) {
  const { data: note, isPending, isError, refetch } = useNote(noteId);

  if (isPending) return <NoteEditorSkeleton />;

  if (isError) {
    return (
      <div className="space-y-3 py-24 text-center">
        <p className="text-muted-foreground">Couldn&apos;t load this note.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!note) {
    return (
      <p className="py-24 text-center text-muted-foreground">
        This note doesn&apos;t exist or was deleted.
      </p>
    );
  }

  return <NoteDocument key={note.id} note={note} />;
}

function NoteDocument({ note }: { note: Note }) {
  const { mutate } = useUpdateNote(note.id);
  const [title, setTitle] = useState(note.title);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const pendingPatch = useRef<NoteUpdate>({});

  const save = useCallback(() => {
    const patch = pendingPatch.current;
    if (Object.keys(patch).length === 0) return;
    pendingPatch.current = {};
    setStatus("saving");

    mutate(patch, {
      onSuccess: () => {
        if (Object.keys(pendingPatch.current).length === 0) setStatus("saved");
      },
      onError: () => {
        pendingPatch.current = { ...patch, ...pendingPatch.current };
        setStatus("error");
      },
    });
  }, [mutate]);

  const { debounced: scheduleSave, flush } = useDebouncedCallback(save, AUTOSAVE_DELAY_MS);

  const queueChange = useCallback(
    (patch: NoteUpdate) => {
      pendingPatch.current = { ...pendingPatch.current, ...patch };
      setStatus("unsaved");
      scheduleSave();
    },
    [scheduleSave],
  );

  const handleContentChange = useCallback(
    ({ content, plainText }: EditorChange) => {
      queueChange({ content, plain_text: plainText });
    },
    [queueChange],
  );

  useEffect(() => {
    if (status === "saved") return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  return (
    <article className="space-y-2">
      <div className="flex h-6 items-center justify-end">
        <SaveIndicator status={status} onRetry={save} />
      </div>
      <input
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          queueChange({ title: event.target.value });
        }}
        onBlur={flush}
        placeholder="Untitled"
        aria-label="Note title"
        className="w-full bg-transparent text-3xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/50 md:text-4xl"
      />
      <Editor initialContent={note.content as JSONContent | null} onChange={handleContentChange} />
    </article>
  );
}

function SaveIndicator({ status, onRetry }: { status: SaveStatus; onRetry: () => void }) {
  return (
    <div aria-live="polite" className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {status === "saving" && (
        <>
          <Loader2 className="size-3 animate-spin" /> Saving…
        </>
      )}
      {status === "unsaved" && "Unsaved changes"}
      {status === "saved" && (
        <>
          <Check className="size-3" /> Saved
        </>
      )}
      {status === "error" && (
        <>
          <CloudAlert className="size-3 text-destructive" />
          <span className="text-destructive">Couldn&apos;t save</span>
          <Button variant="link" size="xs" onClick={onRetry}>
            Retry
          </Button>
        </>
      )}
    </div>
  );
}

export function NoteEditorSkeleton() {
  return (
    <div className="space-y-4 pt-8">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );
}
