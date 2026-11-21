import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type PageHeaderProps = {
  title: string;
  description: string;
  backHref?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, backHref = "/notes", actions }: PageHeaderProps) {
  return (
    <header className="space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link href={backHref}>
          <ArrowLeft data-icon="inline-start" />
          Back
        </Link>
      </Button>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {actions}
      </div>
    </header>
  );
}
