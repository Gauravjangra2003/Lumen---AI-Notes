"use client";

import { useState, type ReactNode } from "react";
import { Quote as QuoteIcon, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { pickRandom } from "@/lib/random";

import { QUOTES } from "../data/quotes";
import type { Quote } from "../types";

/** Wraps `trigger` so that clicking it opens a popup with a random quote. */
export function DailyQuoteDialog({ trigger }: { trigger: ReactNode }) {
  const [quote, setQuote] = useState<Quote | null>(null);

  function showNextQuote() {
    setQuote((current) => pickRandom(QUOTES, current ?? undefined));
  }

  return (
    <Dialog onOpenChange={(open) => open && showNextQuote()}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="gap-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Daily quote</DialogTitle>
          <DialogDescription>A little inspiration for your next note.</DialogDescription>
        </DialogHeader>

        {quote && (
          <figure
            key={quote.text}
            className="relative animate-in space-y-3 rounded-lg bg-amber-500/10 p-5 fade-in-0 slide-in-from-bottom-1"
          >
            <QuoteIcon aria-hidden className="size-6 text-amber-500" />
            <blockquote className="text-lg leading-relaxed font-medium text-balance">
              {quote.text}
            </blockquote>
            <figcaption className="text-sm text-muted-foreground">— {quote.author}</figcaption>
          </figure>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={showNextQuote}>
            <RefreshCw data-icon="inline-start" />
            Another quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
