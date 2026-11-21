"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, LogOut, MoreHorizontal, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { useCreateNote, useDeleteNote, useNotes } from "../hooks/use-notes";

export function NotesSidebar({ className }: { className?: string }) {
  const router = useRouter();
  const createNote = useCreateNote();

  function handleCreate() {
    createNote.mutate(undefined, {
      onSuccess: (note) => router.push(`/notes/${note.id}`),
    });
  }

  return (
    <aside className={cn("flex h-full w-64 shrink-0 flex-col border-r bg-sidebar", className)}>
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/notes" className="font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="New note"
          onClick={handleCreate}
          disabled={createNote.isPending}
        >
          <Plus />
        </Button>
      </div>

      <nav aria-label="Notes" className="flex-1 overflow-y-auto px-2 pb-2">
        <Suspense fallback={<NotesListSkeleton />}>
          <NotesList />
        </Suspense>
      </nav>

      <UserFooter />
    </aside>
  );
}

function NotesListSkeleton() {
  return (
    <div className="space-y-2 px-2 pt-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-7 w-full" />
      ))}
    </div>
  );
}

function NotesList() {
  const router = useRouter();
  const params = useParams<{ noteId?: string }>();
  const activeId = params.noteId;

  const { data: notes, isPending, isError, refetch } = useNotes();
  const deleteNote = useDeleteNote();

  function handleDelete(id: string) {
    deleteNote.mutate(id);
    if (id === activeId) router.push("/notes");
  }

  if (isPending) return <NotesListSkeleton />;

  return (
    <>
      {isError && (
        <div className="space-y-2 px-2 pt-2 text-sm text-muted-foreground">
          <p>Couldn&apos;t load notes. Did you run the database migration?</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {notes?.length === 0 && (
        <p className="px-2 pt-2 text-sm text-muted-foreground">No notes yet.</p>
      )}

      <ul className="space-y-0.5">
        {notes?.map((note) => (
          <li key={note.id} className="group/note relative">
            <Link
              href={`/notes/${note.id}`}
              aria-current={note.id === activeId ? "page" : undefined}
              className="flex h-8 items-center gap-2 rounded-md px-2 pr-8 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-medium aria-[current=page]:text-sidebar-accent-foreground"
            >
              {note.icon ? (
                <span aria-hidden>{note.icon}</span>
              ) : (
                <FileText className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="truncate">{note.title || "Untitled"}</span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`Options for ${note.title || "Untitled"}`}
                  className="absolute top-1/2 right-1 -translate-y-1/2 opacity-0 group-hover/note:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100"
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="right">
                <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(note.id)}>
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>
    </>
  );
}

function UserFooter() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: email } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const { data } = await createClient().auth.getUser();
      return data.user?.email ?? null;
    },
    staleTime: Infinity,
  });

  async function handleSignOut() {
    await createClient().auth.signOut();
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 border-t px-4 py-3">
      <span className="flex-1 truncate text-xs text-muted-foreground">{email}</span>
      <Button size="icon-sm" variant="ghost" aria-label="Sign out" onClick={handleSignOut}>
        <LogOut />
      </Button>
    </div>
  );
}
