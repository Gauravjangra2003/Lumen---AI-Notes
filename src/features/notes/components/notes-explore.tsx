import { Brain, LayoutTemplate, Quote } from "lucide-react";

import { FeatureCard } from "@/components/feature-card";
import { DailyQuoteDialog } from "@/features/quotes";

export function NotesExplore() {
  return (
    <section aria-labelledby="explore-heading" className="@container w-full space-y-3">
      <h2 id="explore-heading" className="text-sm font-medium text-muted-foreground">
        Explore
      </h2>
      <div className="grid gap-3 @md:grid-cols-2 @xl:grid-cols-3">
        <FeatureCard
          href="/notes/quiz"
          icon={Brain}
          title="Quiz"
          description="Test yourself with random questions, one at a time."
          accentClassName="bg-ai-muted text-ai"
        />
        <FeatureCard
          href="/notes/templates"
          icon={LayoutTemplate}
          title="Templates"
          description="Start a note from a fresh mix of ready-made designs."
          accentClassName="bg-sky-500/15 text-sky-500"
        />
        <DailyQuoteDialog
          trigger={
            <FeatureCard
              icon={Quote}
              title="Daily quote"
              description="Open a random dose of inspiration whenever you need it."
              accentClassName="bg-amber-500/15 text-amber-500"
            />
          }
        />
      </div>
    </section>
  );
}
