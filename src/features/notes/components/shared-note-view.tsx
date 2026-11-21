import Link from "next/link";
import type { JSONContent } from "@tiptap/react";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { Eye, Lock, PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import { documentExtensions } from "@/features/editor/extensions";

import type { SharedNoteResult } from "../api/shared";
import { getSharePath } from "../lib/share-url";
import { SharedNoteDownloadButton } from "./shared-note-download-button";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export function SharedNoteView({ result, token }: { result: SharedNoteResult; token: string }) {
  if (result.status === "unavailable") {
    return <SharedNoteUnavailable isSignedIn={result.isSignedIn} token={token} />;
  }

  const { note } = result;
  const content = note.content as JSONContent | null;
  const title = note.title || "Untitled";

  return (
    <SharedNoteShell
      actions={
        <>
          {note.is_owner && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/notes/${note.id}`}>
                <PencilLine /> Edit
              </Link>
            </Button>
          )}
          <SharedNoteDownloadButton title={note.title} content={content} />
        </>
      }
    >
      {note.is_owner && note.share_access === "private" && (
        <p className="mb-6 flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          <Lock className="size-4 shrink-0" />
          Sharing is off, so only you can see this page.
        </p>
      )}
      <article className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight break-words md:text-4xl">
            {note.icon && <span className="mr-2">{note.icon}</span>}
            {title}
          </h1>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="size-3.5" /> Read-only · Updated{" "}
            <time dateTime={note.updated_at}>
              {dateFormatter.format(new Date(note.updated_at))}
            </time>
          </p>
        </header>
        <div className="tiptap-content">
          {content ? (
            renderToReactElement({ content, extensions: documentExtensions })
          ) : (
            <p className="text-muted-foreground">This note is empty.</p>
          )}
        </div>
      </article>
    </SharedNoteShell>
  );
}

function SharedNoteUnavailable({ isSignedIn, token }: { isSignedIn: boolean; token: string }) {
  const loginHref = `/login?next=${encodeURIComponent(getSharePath(token))}`;

  return (
    <SharedNoteShell>
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <Lock className="size-10 text-muted-foreground" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">This note isn&apos;t available</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            {isSignedIn
              ? "You don't have access, the owner stopped sharing it, or the link was reset."
              : "It may be private, or the link was reset. If it was shared with you, sign in with the email it was shared to."}
          </p>
        </div>
        {!isSignedIn && (
          <Button asChild>
            <Link href={loginHref}>Sign in to view</Link>
          </Button>
        )}
      </div>
    </SharedNoteShell>
  );
}

function SharedNoteShell({
  actions,
  children,
}: {
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-12 w-full max-w-3xl items-center gap-2 px-4 sm:px-6">
          <Link href="/" className="mr-auto font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
          {actions}
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 md:py-12">{children}</main>
    </div>
  );
}

export function SharedNoteSkeleton() {
  return (
    <SharedNoteShell>
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-8 h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </SharedNoteShell>
  );
}
