import { createClient } from "@/lib/supabase/client";

import type { ShareInvite } from "../types";

export async function fetchShareInvites(noteId: string): Promise<ShareInvite[]> {
  const { data, error } = await createClient()
    .from("note_share_invites")
    .select("*")
    .eq("note_id", noteId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addShareInvite(noteId: string, email: string): Promise<ShareInvite> {
  const { data, error } = await createClient()
    .from("note_share_invites")
    .insert({ note_id: noteId, email: email.trim().toLowerCase() })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function removeShareInvite(noteId: string, email: string): Promise<void> {
  const { error } = await createClient()
    .from("note_share_invites")
    .delete()
    .eq("note_id", noteId)
    .eq("email", email);
  if (error) throw error;
}
