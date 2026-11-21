import type { NotesFilter, NotesSort, NoteSummary } from "../types";

const SNIPPET_RADIUS = 60;

/** A short excerpt of `text` around the first match of `query`, or null if it only matched the title. */
export function toSnippet(text: string, query: string): string | null {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return null;

  const start = Math.max(0, index - SNIPPET_RADIUS);
  const end = Math.min(text.length, index + query.length + SNIPPET_RADIUS);
  const excerpt = text.slice(start, end).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "…" : ""}${excerpt}${end < text.length ? "…" : ""}`;
}

const compareBy: Record<NotesSort, (a: NoteSummary, b: NoteSummary) => number> = {
  created: (a, b) => b.created_at.localeCompare(a.created_at),
  updated: (a, b) => b.updated_at.localeCompare(a.updated_at),
  title: (a, b) =>
    (a.title || "Untitled").localeCompare(b.title || "Untitled", undefined, {
      sensitivity: "base",
      numeric: true,
    }),
};

export function arrangeNotes<T extends NoteSummary>(
  notes: T[],
  { sort, filter }: { sort: NotesSort; filter: NotesFilter },
): T[] {
  const visible =
    filter === "shared" ? notes.filter((note) => note.share_access !== "private") : notes;
  return visible.toSorted(compareBy[sort]);
}
