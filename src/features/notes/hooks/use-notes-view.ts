"use client";

import { z } from "zod";

import { createPersistedStore } from "@/lib/persisted-store";

import type { NotesFilter, NotesSort } from "../types";

const viewSchema = z.object({
  sort: z.enum(["created", "updated", "title"]).catch("created"),
  filter: z.enum(["all", "shared"]).catch("all"),
});

const notesViewStore = createPersistedStore<{ sort: NotesSort; filter: NotesFilter }>({
  key: "lumen-notes-view",
  defaults: { sort: "created", filter: "all" },
  parse: (raw) => viewSchema.parse(raw ?? {}),
});

export function useNotesView() {
  const sort = notesViewStore.useStore((state) => state.sort);
  const filter = notesViewStore.useStore((state) => state.filter);
  return {
    sort,
    filter,
    setSort: (next: NotesSort) => notesViewStore.setState({ sort: next }),
    setFilter: (next: NotesFilter) => notesViewStore.setState({ filter: next }),
  };
}
