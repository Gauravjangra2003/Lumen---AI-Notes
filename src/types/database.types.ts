// Mirrors supabase/migrations. Regenerate with:
// npx supabase gen types typescript --project-id <project-ref> > src/types/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ShareAccess = "private" | "public" | "invited";

export type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          icon: string | null;
          content: Json | null;
          plain_text: string;
          share_token: string;
          share_access: ShareAccess;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          title?: string;
          icon?: string | null;
          content?: Json | null;
          plain_text?: string;
          share_token?: string;
          share_access?: ShareAccess;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          icon?: string | null;
          content?: Json | null;
          plain_text?: string;
          share_token?: string;
          share_access?: ShareAccess;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      note_share_invites: {
        Row: {
          note_id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          note_id: string;
          email: string;
          created_at?: string;
        };
        Update: {
          note_id?: string;
          email?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "note_share_invites_note_id_fkey";
            columns: ["note_id"];
            isOneToOne: false;
            referencedRelation: "notes";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      get_shared_note: {
        Args: { token: string };
        Returns: {
          id: string;
          title: string;
          icon: string | null;
          content: Json | null;
          share_access: ShareAccess;
          updated_at: string;
          is_owner: boolean;
        }[];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
