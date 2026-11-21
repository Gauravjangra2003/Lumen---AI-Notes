import type { Database } from "@/types/database.types";

export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type NoteSummary = Pick<Note, "id" | "title" | "icon" | "created_at" | "updated_at">;
export type NoteUpdate = Pick<
  Database["public"]["Tables"]["notes"]["Update"],
  "title" | "icon" | "content" | "plain_text"
>;
