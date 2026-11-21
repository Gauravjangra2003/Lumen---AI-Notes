"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileDown,
  FileText,
  Globe,
  LogOut,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Share2,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { siteConfig } from "@/config/site";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { useDownloadNotePdf } from "../hooks/use-download-pdf";
import { useCreateNote, useDeleteNote, useNoteSearch, useNotes } from "../hooks/use-notes";
import { useNotesView } from "../hooks/use-notes-view";
import { arrangeNotes } from "../lib/search";
import type { NoteSearchResult, NoteSummary } from "../types";
import { NotesSearch } from "./notes-search";
import { ShareNoteDialog } from "./share-note-dialog";

const SEARCH_DEBOUNCE_MS = 200;

type NotesSidebarProps = {
  className?: string;
  /** Called after the user picks or creates a note, e.g. to close the mobile drawer. */
  onNavigate?: () => void;
  /** Shows a collapse button in the header when provided. */
  onCollapse?: () => void;
};

export function NotesSidebar({ className, onNavigate, onCollapse }: NotesSidebarProps) {
  const router = useRouter();
  const createNote = useCreateNote();
  const [query, setQuery] = useState("");

  function handleCreate() {
    createNote.mutate(undefined, {
      onSuccess: (note) => {
        setQuery("");
        router.push(`/notes/${note.id}`);
        onNavigate?.();
      },
    });
  }

  return (
    <aside className={cn("flex h-full w-64 shrink-0 flex-col bg-sidebar", className)}>
      <div className="flex items-center gap-1 px-4 py-3">
        <Link
          href="/notes"
          onClick={onNavigate}
          className="mr-auto truncate font-semibold tracking-tight"
        >
          {siteConfig.name}
        </Link>
        {onCollapse && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                id="sidebar-collapse"
                size="icon-sm"
                variant="ghost"
                aria-label="Collapse sidebar"
                onClick={onCollapse}
              >
                <PanelLeftClose />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Collapse sidebar (⌘\)</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="New note"
              onClick={handleCreate}
              disabled={createNote.isPending}
            >
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New note</TooltipContent>
        </Tooltip>
      </div>

      <NotesSearch query={query} onQueryChange={setQuery} />

      <nav aria-label="Notes" className="flex-1 overflow-y-auto px-2 pb-2">
        <Suspense fallback={<NotesListSkeleton />}>
          <NotesList query={query} onNavigate={onNavigate} />
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

function NotesList({ query, onNavigate }: { query: string; onNavigate?: () => void }) {
  const router = useRouter();
  const params = useParams<{ noteId?: string }>();
  const activeId = params.noteId;
  const [sharingId, setSharingId] = useState<string | null>(null);

  const { sort, filter } = useNotesView();
  const searchTerm = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const isSearching = searchTerm.length > 0;

  const list = useNotes();
  const search = useNoteSearch(searchTerm);
  const source = isSearching ? search : list;

  const deleteNote = useDeleteNote();
  const downloadPdf = useDownloadNotePdf();

  function handleDelete(id: string) {
    deleteNote.mutate(id);
    if (id === activeId) router.push("/notes");
  }

  if (source.isPending) return <NotesListSkeleton />;

  const notes = arrangeNotes<NoteSummary | NoteSearchResult>(source.data ?? [], { sort, filter });

  return (
    <>
      {source.isError && (
        <div className="space-y-2 px-2 pt-2 text-sm text-muted-foreground">
          <p>
            {isSearching
              ? "Search failed."
              : "Couldn't load notes. Did you run the database migrations?"}
          </p>
          <Button size="sm" variant="outline" onClick={() => source.refetch()}>
            Try again
          </Button>
        </div>
      )}

      {isSearching && (
        <p className="sr-only" aria-live="polite">
          {notes.length === 1 ? "1 note found" : `${notes.length} notes found`}
        </p>
      )}

      {!source.isError && notes.length === 0 && (
        <p className="px-2 pt-2 text-sm break-words text-muted-foreground">
          {isSearching
            ? `No notes match “${searchTerm}”.`
            : filter === "shared"
              ? "No shared notes yet."
              : "No notes yet."}
        </p>
      )}

      <ul
        className={cn("space-y-0.5 transition-opacity", search.isPlaceholderData && "opacity-60")}
      >
        {notes.map((note) => (
          <NoteListItem
            key={note.id}
            note={note}
            highlight={isSearching ? searchTerm : ""}
            isActive={note.id === activeId}
            onNavigate={onNavigate}
            onShare={() => setSharingId(note.id)}
            onDownloadPdf={() => downloadPdf(note.id)}
            onDelete={() => handleDelete(note.id)}
          />
        ))}
      </ul>

      <ShareNoteDialog
        noteId={sharingId ?? ""}
        open={sharingId !== null}
        onOpenChange={(open) => !open && setSharingId(null)}
      />
    </>
  );
}

type NoteListItemProps = {
  note: NoteSummary | NoteSearchResult;
  highlight: string;
  isActive: boolean;
  onNavigate?: () => void;
  onShare: () => void;
  onDownloadPdf: () => void;
  onDelete: () => void;
};

function NoteListItem({
  note,
  highlight,
  isActive,
  onNavigate,
  onShare,
  onDownloadPdf,
  onDelete,
}: NoteListItemProps) {
  const title = note.title || "Untitled";
  const snippet = "snippet" in note ? note.snippet : null;
  const ShareIcon =
    note.share_access === "public" ? Globe : note.share_access === "invited" ? Users : null;

  return (
    <li className="group/note relative">
      <Link
        href={`/notes/${note.id}`}
        aria-current={isActive ? "page" : undefined}
        onClick={onNavigate}
        className="flex min-h-10 items-center gap-2 rounded-md px-2 py-1 pr-8 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-medium aria-[current=page]:text-sidebar-accent-foreground md:min-h-8"
      >
        {note.icon ? (
          <span aria-hidden className="self-start pt-px">
            {note.icon}
          </span>
        ) : (
          <FileText
            className={cn("size-4 shrink-0 text-muted-foreground", snippet && "mt-0.5 self-start")}
          />
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate">
              <Highlight text={title} query={highlight} />
            </span>
            {ShareIcon && (
              <ShareIcon
                aria-label={
                  note.share_access === "public" ? "Shared publicly" : "Shared with people"
                }
                className="size-3 shrink-0 text-sky-500"
              />
            )}
          </span>
          {snippet && (
            <span className="mt-0.5 line-clamp-2 text-xs font-normal text-muted-foreground">
              <Highlight text={snippet} query={highlight} />
            </span>
          )}
        </span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Options for ${title}`}
            className="absolute top-1/2 right-1 -translate-y-1/2 md:size-6 md:opacity-0 md:group-hover/note:opacity-100 md:focus-visible:opacity-100 md:aria-expanded:opacity-100"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onSelect={onShare}>
            <Share2 /> Share…
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onDownloadPdf}>
            <FileDown /> Download as PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={index} className="rounded-sm bg-yellow-400/30 text-inherit">
        {part}
      </mark>
    ) : (
      part
    ),
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
