import { Brain } from "lucide-react";

import { FeatureCard } from "@/components/feature-card";

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
      </div>
    </section>
  );
}
