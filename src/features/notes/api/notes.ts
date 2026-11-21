import { createClient } from "@/lib/supabase/client";

import { toSnippet } from "../lib/search";
import type { Note, NoteInsert, NoteSearchResult, NoteSummary, NoteUpdate } from "../types";

const SUMMARY_COLUMNS = "id, title, icon, share_access, created_at, updated_at";
/** Columns that exist before the sharing migration (0002) has been run. */
const LEGACY_SUMMARY_COLUMNS = "id, title, icon, created_at, updated_at";
const UNDEFINED_COLUMN = "42703";
const SEARCH_LIMIT = 50;

/**
 * Runs `query` with the full summary columns, falling back to the pre-sharing
 * columns (every note treated as private) so the app keeps working until the
 * sharing migration is applied.
 */
async function selectSummaries<Row extends object>(
  query: (columns: string) => PromiseLike<{ data: unknown; error: { code: string } | null }>,
): Promise<(Row & Pick<NoteSummary, "share_access">)[]> {
  const result = await query(SUMMARY_COLUMNS);
  if (result.error?.code !== UNDEFINED_COLUMN) {
    if (result.error) throw result.error;
    return result.data as (Row & Pick<NoteSummary, "share_access">)[];
  }

  const legacy = await query(LEGACY_SUMMARY_COLUMNS);
  if (legacy.error) throw legacy.error;
  return (legacy.data as Row[]).map((row) => ({ ...row, share_access: "private" as const }));
}

export function fetchNotes(): Promise<NoteSummary[]> {
  return selectSummaries<NoteSummary>((columns) =>
    createClient().from("notes").select(columns).order("created_at", { ascending: false }),
  );
}

/** Matches `%`, `_` and `\` literally inside an ILIKE pattern. */
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/** Quotes a value for a PostgREST filter so commas and parentheses stay literal. */
function quoteFilterValue(value: string) {
  return `"${value.replace(/[\\"]/g, (char) => `\\${char}`)}"`;
}

export async function searchNotes(query: string): Promise<NoteSearchResult[]> {
  const pattern = quoteFilterValue(`%${escapeLike(query)}%`);
  const rows = await selectSummaries<NoteSummary & { plain_text: string }>((columns) =>
    createClient()
      .from("notes")
      .select(`${columns}, plain_text`)
      .or(`title.ilike.${pattern},plain_text.ilike.${pattern}`)
      .order("updated_at", { ascending: false })
      .limit(SEARCH_LIMIT),
  );
  return rows.map(({ plain_text, ...note }) => ({
    ...note,
    snippet: toSnippet(plain_text, query),
  }));
}

export async function fetchNote(id: string): Promise<Note | null> {
  const { data, error } = await createClient().from("notes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createNote(input: NoteInsert = {}): Promise<Note> {
  const { data, error } = await createClient().from("notes").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateNote(id: string, patch: NoteUpdate): Promise<Note> {
  const { data, error } = await createClient()
    .from("notes")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await createClient().from("notes").delete().eq("id", id);
  if (error) throw error;
}
