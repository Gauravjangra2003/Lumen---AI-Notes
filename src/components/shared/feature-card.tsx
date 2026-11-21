import type { ComponentProps } from "react";
import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type FeatureCardProps = ComponentProps<"button"> & {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Classes for the icon tile, e.g. its background and text colour. */
  accentClassName?: string;
  /** Renders a link instead of a button. */
  href?: string;
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  accentClassName,
  href,
  className,
  ...buttonProps
}: FeatureCardProps) {
  const classes = cn(
    "group/feature relative flex h-full flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-all outline-none hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    className,
  );

  const content = (
    <>
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-lg bg-muted",
            accentClassName,
          )}
        >
          <Icon className="size-5" />
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover/feature:opacity-100 group-focus-visible/feature:opacity-100" />
      </div>
      <div className="space-y-1">
        <h2 className="font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
