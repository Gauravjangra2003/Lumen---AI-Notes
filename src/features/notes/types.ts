import type { Database, ShareAccess } from "@/types/database.types";

export type { ShareAccess };

export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type NoteSummary = Pick<
  Note,
  "id" | "title" | "icon" | "share_access" | "created_at" | "updated_at"
>;
export type NoteSearchResult = NoteSummary & { snippet: string | null };
export type NoteInsert = Pick<
  Database["public"]["Tables"]["notes"]["Insert"],
  "title" | "icon" | "content" | "plain_text"
>;
export type NoteUpdate = Pick<
  Database["public"]["Tables"]["notes"]["Update"],
  "title" | "icon" | "content" | "plain_text" | "share_access" | "share_token"
>;

export type ShareInvite = Database["public"]["Tables"]["note_share_invites"]["Row"];
export type SharedNote = Database["public"]["Functions"]["get_shared_note"]["Returns"][number];

export type NotesSort = "created" | "updated" | "title";
export type NotesFilter = "all" | "shared";
