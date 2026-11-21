import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">{siteConfig.name}</h1>
        <p className="text-muted-foreground">{siteConfig.tagline}</p>
      </div>
      <Button asChild size="lg">
        <Link href="/notes">Open my notes</Link>
      </Button>
    </main>
  );
}
