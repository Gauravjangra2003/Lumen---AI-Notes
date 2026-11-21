"use client";

import { useState } from "react";
import { FileDown, Globe, Link2, Lock, MoreHorizontal, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { getShareUrl } from "../lib/share-url";
import type { Note } from "../types";
import { ShareNoteDialog } from "./share-note-dialog";

const SHARE_STATE = {
  private: { icon: Lock, hint: "Only you can read this note" },
  public: { icon: Globe, hint: "Anyone with the link can read" },
  invited: { icon: Users, hint: "Only invited people can read" },
} as const;

type NoteActionsProps = {
  note: Note;
  onDownloadPdf: () => void;
};

export function NoteActions({ note, onDownloadPdf }: NoteActionsProps) {
  const [shareOpen, setShareOpen] = useState(false);
  // share_access is missing until the sharing migration has run; treat that as private.
  const access = note.share_access ?? "private";
  const { icon: ShareIcon, hint } = SHARE_STATE[access];
  const isShared = access !== "private";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getShareUrl(note.share_token));
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link.");
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShareOpen(true)}
            className={isShared ? "text-sky-500 hover:text-sky-500" : undefined}
          >
            <ShareIcon /> Share
          </Button>
        </TooltipTrigger>
        <TooltipContent>{hint}</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="ghost" aria-label="More note actions">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onSelect={onDownloadPdf}>
            <FileDown /> Download as PDF
          </DropdownMenuItem>
          {isShared && (
            <DropdownMenuItem onSelect={copyLink}>
              <Link2 /> Copy share link
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ShareNoteDialog noteId={note.id} open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}
