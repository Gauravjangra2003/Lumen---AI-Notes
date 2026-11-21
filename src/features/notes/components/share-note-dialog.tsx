"use client";

import { useState, type FormEvent } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Lock,
  RefreshCw,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  useAddShareInvite,
  useRemoveShareInvite,
  useShareInvites,
} from "../hooks/use-note-sharing";
import { useNote, useUpdateNote } from "../hooks/use-notes";
import { getShareUrl } from "../lib/share-url";
import type { Note, ShareAccess } from "../types";

const ACCESS_OPTIONS: {
  value: ShareAccess;
  icon: LucideIcon;
  label: string;
  description: string;
}[] = [
  {
    value: "private",
    icon: Lock,
    label: "Only me",
    description: "Sharing is off. The link only works for you.",
  },
  {
    value: "public",
    icon: Globe,
    label: "Anyone with the link",
    description: "Anyone who has the link can read it. No sign-in needed.",
  },
  {
    value: "invited",
    icon: Users,
    label: "Only people you invite",
    description: "Invited people sign in with their email to read it.",
  },
];

const emailSchema = z.email("Enter a valid email address");

const SHARING_ERROR = "Couldn't update sharing. Did you run the sharing database migration?";

type ShareNoteDialogProps = {
  noteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShareNoteDialog({ noteId, open, onOpenChange }: ShareNoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && <ShareNoteDialogBody noteId={noteId} />}
      </DialogContent>
    </Dialog>
  );
}

function ShareNoteDialogBody({ noteId }: { noteId: string }) {
  const { data: note, isPending, isError } = useNote(noteId);

  if (isPending) {
    return (
      <div className="space-y-3">
        <DialogTitle>Share note</DialogTitle>
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (isError || !note) {
    return (
      <>
        <DialogTitle>Share note</DialogTitle>
        <p className="text-sm text-muted-foreground">Couldn&apos;t load this note.</p>
      </>
    );
  }

  if (!note.share_token) {
    return (
      <>
        <DialogTitle>Share note</DialogTitle>
        <p className="text-sm text-muted-foreground">
          Sharing isn&apos;t set up yet. Run <code>supabase/migrations/0002_note_sharing.sql</code>{" "}
          in the Supabase SQL editor, then reload.
        </p>
      </>
    );
  }

  return <ShareSettings note={note} />;
}

function ShareSettings({ note }: { note: Note }) {
  const update = useUpdateNote(note.id);
  const access = (update.isPending && update.variables.share_access) || note.share_access;
  const isShared = access !== "private";

  function changeAccess(next: ShareAccess) {
    if (next === access) return;
    update.mutate({ share_access: next }, { onError: () => toast.error(SHARING_ERROR) });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="truncate pr-6">Share “{note.title || "Untitled"}”</DialogTitle>
        <DialogDescription>
          People with access can read this note but can&apos;t edit it.
        </DialogDescription>
      </DialogHeader>

      <div role="radiogroup" aria-label="Who can read this note" className="grid gap-1.5">
        {ACCESS_OPTIONS.map(({ value, icon: Icon, label, description }) => {
          const selected = value === access;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={update.isPending}
              onClick={() => changeAccess(value)}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors outline-none hover:bg-accent/50 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-progress",
                selected && "border-primary/40 bg-accent/60",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
                  selected && value !== "private" && "bg-sky-500/15 text-sky-500",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1 space-y-0.5">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-xs text-muted-foreground">{description}</span>
              </span>
              {selected &&
                (update.isPending ? (
                  <Loader2 className="mt-1 size-4 animate-spin text-muted-foreground" />
                ) : (
                  <Check className="mt-1 size-4" />
                ))}
            </button>
          );
        })}
      </div>

      {access === "invited" && <InviteList noteId={note.id} />}

      <ShareLink note={note} isShared={isShared} />
    </>
  );
}

function InviteList({ noteId }: { noteId: string }) {
  const { data: invites, isPending } = useShareInvites(noteId);
  const addInvite = useAddShareInvite(noteId);
  const removeInvite = useRemoveShareInvite(noteId);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email.trim().toLowerCase());
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setError(null);
    addInvite.mutate(parsed.data, { onSuccess: () => setEmail("") });
  }

  return (
    <section aria-labelledby="invite-heading" className="space-y-2">
      <h3 id="invite-heading" className="text-xs font-medium text-muted-foreground">
        People with access
      </h3>
      <form onSubmit={handleSubmit} className="flex gap-2" noValidate>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          aria-label="Email to invite"
          aria-invalid={Boolean(error)}
          autoComplete="off"
        />
        <Button type="submit" variant="secondary" disabled={addInvite.isPending}>
          {addInvite.isPending && <Loader2 className="animate-spin" />}
          Invite
        </Button>
      </form>
      {error && <p className="text-xs text-destructive">{error}</p>}

      {isPending ? (
        <Skeleton className="h-8 w-full" />
      ) : invites?.length ? (
        <ul className="max-h-40 space-y-1 overflow-y-auto">
          {invites.map((invite) => (
            <li
              key={invite.email}
              className="flex items-center gap-2 rounded-md bg-muted/50 py-1 pr-1 pl-2.5 text-sm"
            >
              <span className="flex-1 truncate">{invite.email}</span>
              <Button
                size="icon-xs"
                variant="ghost"
                aria-label={`Remove ${invite.email}`}
                onClick={() => removeInvite.mutate(invite.email)}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          No one yet. Invite people by the email they sign in with.
        </p>
      )}
    </section>
  );
}

function ShareLink({ note, isShared }: { note: Note; isShared: boolean }) {
  const update = useUpdateNote(note.id);
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const url = getShareUrl(note.share_token);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy the link.");
    }
  }

  function resetLink() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    update.mutate(
      { share_token: crypto.randomUUID() },
      {
        onSuccess: () => toast.success("New link created. The old one no longer works."),
        onError: () => toast.error(SHARING_ERROR),
        onSettled: () => setConfirmReset(false),
      },
    );
  }

  return (
    <section aria-labelledby="link-heading" className="space-y-2">
      <h3 id="link-heading" className="text-xs font-medium text-muted-foreground">
        Read-only link
      </h3>
      <div className="flex gap-2">
        <Input
          readOnly
          value={url}
          aria-label="Share link"
          onFocus={(event) => event.currentTarget.select()}
          className={cn("font-mono text-xs md:text-xs", !isShared && "text-muted-foreground")}
        />
        <Button variant="secondary" onClick={copy} aria-label="Copy link">
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      {!isShared && (
        <p className="text-xs text-muted-foreground">
          Choose who can read this note to turn the link on.
        </p>
      )}
      <div className="flex items-center justify-between gap-2 pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetLink}
          onBlur={() => setConfirmReset(false)}
          disabled={update.isPending}
          className={cn(confirmReset && "text-destructive hover:text-destructive")}
        >
          {update.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          {confirmReset ? "Old link will stop working. Confirm?" : "Reset link"}
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink /> Preview
          </a>
        </Button>
      </div>
    </section>
  );
}
