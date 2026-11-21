import "server-only";

import { cache } from "react";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import type { SharedNote } from "../types";

const tokenSchema = z.uuid();

export type SharedNoteResult =
  { status: "ok"; note: SharedNote } | { status: "unavailable"; isSignedIn: boolean };

/** Deduplicated per request so metadata and the page share one lookup. */
export const getSharedNote = cache(async (token: string): Promise<SharedNoteResult> => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(auth?.claims);

  if (!tokenSchema.safeParse(token).success) return { status: "unavailable", isSignedIn };

  const { data, error } = await supabase.rpc("get_shared_note", { token });
  if (error) throw error;

  const note = data[0];
  return note ? { status: "ok", note } : { status: "unavailable", isSignedIn };
});
