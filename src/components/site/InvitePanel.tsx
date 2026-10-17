import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type InvitePanelProps = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  children?: ReactNode;
  className?: string;
};

export function InvitePanel({
  title,
  description,
  primaryLabel,
  primaryTo,
  secondaryLabel,
  secondaryTo,
  children,
  className,
}: InvitePanelProps) {
  return (
    <section className={cn("container", className)}>
      <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground sm:rounded-[2.5rem] sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-16 h-72 w-72 rounded-full border border-primary-foreground/15 sm:h-96 sm:w-96"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-4 h-72 w-72 rounded-full border border-primary-foreground/10 sm:h-96 sm:w-96"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-10 top-0 h-[3px] w-24 rounded-full bg-accent"
        />

        <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center md:gap-12">
          <div>
            <h2 className="text-[1.75rem] leading-tight text-primary-foreground sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-primary-foreground/80">
              {description}
            </p>
            {children}
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <Button
              asChild
              className="h-12 w-full rounded-full bg-secondary px-7 text-[0.95rem] text-primary hover:bg-secondary/90 sm:w-auto"
            >
              <Link to={primaryTo}>
                {primaryLabel}
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            {secondaryLabel && secondaryTo && (
              <Button
                asChild
                variant="ghost"
                className="h-12 w-full rounded-full border border-primary-foreground/25 px-7 text-[0.95rem] text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
              >
                <Link to={secondaryTo}>{secondaryLabel}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
