"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { notesKeys } from "../api/keys";
import {
  createNote,
  deleteNote,
  fetchNote,
  fetchNotes,
  searchNotes,
  updateNote,
} from "../api/notes";
import type { Note, NoteInsert, NoteSummary, NoteUpdate } from "../types";

function toSummary(note: Note): NoteSummary {
  return {
    id: note.id,
    title: note.title,
    icon: note.icon,
    share_access: note.share_access,
    created_at: note.created_at,
    updated_at: note.updated_at,
  };
}

export function useNotes() {
  return useQuery({ queryKey: notesKeys.lists(), queryFn: fetchNotes });
}

export function useNoteSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: notesKeys.search(trimmed),
    queryFn: () => searchNotes(trimmed),
    enabled: trimmed.length > 0,
    placeholderData: keepPreviousData,
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: notesKeys.detail(id),
    queryFn: () => fetchNote(id),
    // The editor owns the document while open; refetching would clobber unsaved typing.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input?: NoteInsert) => createNote(input),
    onSuccess: (note) => {
      queryClient.setQueryData(notesKeys.detail(note.id), note);
      queryClient.setQueryData<NoteSummary[]>(notesKeys.lists(), (notes = []) => [
        toSummary(note),
        ...notes,
      ]);
      void queryClient.invalidateQueries({ queryKey: notesKeys.searches(), refetchType: "none" });
    },
    onError: () => toast.error("Couldn't create a note. Please try again."),
  });
}

export function useUpdateNote(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: NoteUpdate) => updateNote(id, patch),
    onMutate: async (patch) => {
      if (
        patch.title === undefined &&
        patch.icon === undefined &&
        patch.share_access === undefined
      ) {
        return;
      }
      await queryClient.cancelQueries({ queryKey: notesKeys.lists() });
      queryClient.setQueryData<NoteSummary[]>(notesKeys.lists(), (notes) =>
        notes?.map((note) =>
          note.id === id
            ? {
                ...note,
                ...(patch.title !== undefined && { title: patch.title }),
                ...(patch.icon !== undefined && { icon: patch.icon }),
                ...(patch.share_access !== undefined && { share_access: patch.share_access }),
              }
            : note,
        ),
      );
    },
    onSuccess: (note) => {
      queryClient.setQueryData(notesKeys.detail(id), note);
      queryClient.setQueryData<NoteSummary[]>(notesKeys.lists(), (notes) =>
        notes?.map((item) => (item.id === id ? toSummary(note) : item)),
      );
      void queryClient.invalidateQueries({ queryKey: notesKeys.searches(), refetchType: "none" });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notesKeys.lists() });
      const previous = queryClient.getQueryData<NoteSummary[]>(notesKeys.lists());
      queryClient.setQueryData<NoteSummary[]>(notesKeys.lists(), (notes) =>
        notes?.filter((note) => note.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(notesKeys.lists(), context?.previous);
      toast.error("Couldn't delete the note. Please try again.");
    },
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: notesKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: notesKeys.searches() });
      toast.success("Note deleted");
    },
  });
}
