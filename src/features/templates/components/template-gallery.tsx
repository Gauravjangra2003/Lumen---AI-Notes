"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateText } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Loader2, Shuffle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateNote } from "@/features/notes";
import { useIsClient } from "@/hooks/use-is-client";
import { sample } from "@/lib/random";
import { cn } from "@/lib/utils";

import { NOTE_TEMPLATES } from "../data/templates";
import { getHeadings } from "../lib/content";
import type { NoteTemplate } from "../types";

const VISIBLE_TEMPLATES = 6;

export function TemplateGallery() {
  const isClient = useIsClient();

  if (!isClient) return <TemplateGallerySkeleton />;

  return <ShuffledTemplates />;
}

function ShuffledTemplates() {
  const router = useRouter();
  const createNote = useCreateNote();
  const [templates, setTemplates] = useState(() => sample(NOTE_TEMPLATES, VISIBLE_TEMPLATES));
  const [round, setRound] = useState(0);
  const [pendingId, setPendingId] = useState<string | null>(null);

  function handleShuffle() {
    setTemplates(sample(NOTE_TEMPLATES, VISIBLE_TEMPLATES));
    setRound((current) => current + 1);
  }

  function handleUse(template: NoteTemplate) {
    setPendingId(template.id);
    createNote.mutate(
      {
        title: template.name,
        icon: template.icon,
        content: template.content,
        plain_text: generateText(template.content, [StarterKit]),
      },
      {
        onSuccess: (note) => router.push(`/notes/${note.id}`),
        onSettled: () => setPendingId(null),
      },
    );
  }

  return (
    <div className="@container space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing {templates.length} of {NOTE_TEMPLATES.length} designs
        </p>
        <Button variant="outline" onClick={handleShuffle} disabled={createNote.isPending}>
          <Shuffle data-icon="inline-start" />
          Shuffle
        </Button>
      </div>

      <ul key={round} className="grid gap-4 @md:grid-cols-2 @2xl:grid-cols-3">
        {templates.map((template, index) => (
          <li
            key={template.id}
            className="animate-in fade-in-0 fill-mode-both slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <TemplateCard
              template={template}
              isPending={pendingId === template.id}
              disabled={createNote.isPending}
              onUse={() => handleUse(template)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function TemplateCard({
  template,
  isPending,
  disabled,
  onUse,
}: {
  template: NoteTemplate;
  isPending: boolean;
  disabled: boolean;
  onUse: () => void;
}) {
  const headings = getHeadings(template.content).slice(0, 3);

  return (
    <button
      type="button"
      onClick={onUse}
      disabled={disabled}
      aria-label={`Use the ${template.name} template`}
      className="group/template flex h-full w-full flex-col overflow-hidden rounded-xl border bg-card text-left transition-all outline-none hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-wait disabled:hover:translate-y-0"
    >
      <div
        className={cn(
          "relative flex h-32 items-end justify-center bg-linear-to-br px-6 pt-6",
          template.gradientClassName,
        )}
      >
        <span aria-hidden className="absolute top-3 left-4 text-2xl">
          {template.icon}
        </span>
        <div
          aria-hidden
          className="w-full max-w-48 space-y-2 rounded-t-lg border border-b-0 bg-background/90 p-3 shadow-sm transition-transform group-hover/template:-translate-y-1"
        >
          {headings.map((title) => (
            <div key={title} className="space-y-1">
              <p className="truncate text-[10px] leading-none font-semibold">{title}</p>
              <div className="h-1 w-4/5 rounded-full bg-muted-foreground/20" />
            </div>
          ))}
        </div>
        {isPending && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Loader2 className="size-5 animate-spin" />
          </span>
        )}
      </div>
      <div className="space-y-1 border-t p-4">
        <h2 className="font-medium">{template.name}</h2>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </div>
    </button>
  );
}

function TemplateGallerySkeleton() {
  return (
    <div className="@container space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid gap-4 @md:grid-cols-2 @2xl:grid-cols-3">
        {Array.from({ length: VISIBLE_TEMPLATES }, (_, i) => (
          <Skeleton key={i} className="h-52 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
