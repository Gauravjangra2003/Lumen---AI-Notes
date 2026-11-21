import { createClient } from "@/lib/supabase/client";

import type { Note, NoteInsert, NoteSummary, NoteUpdate } from "../types";

const SUMMARY_COLUMNS = "id, title, icon, created_at, updated_at";

export async function fetchNotes(): Promise<NoteSummary[]> {
  const { data, error } = await createClient()
    .from("notes")
    .select(SUMMARY_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
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
