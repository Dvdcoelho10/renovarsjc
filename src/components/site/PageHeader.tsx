import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  imageUrl?: string;
  children?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  imageUrl,
  children,
  className,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border/70 bg-secondary/40",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full border border-primary/10 sm:h-96 sm:w-96"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-16 h-72 w-72 rounded-full border border-primary/10 sm:h-96 sm:w-96"
      />
      <div
        className={cn(
          "container relative py-14 sm:py-20",
          imageUrl && "grid items-center gap-10 lg:grid-cols-[1.1fr_0.8fr] lg:gap-14",
        )}
      >
        <div className="max-w-2xl animate-rise">
          <p className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary">
            <span aria-hidden="true" className="h-[2px] w-7 rounded-full bg-accent" />
            {eyebrow}
          </p>
          <h1 className="mt-5 text-[2.1rem] leading-[1.1] sm:text-5xl">{title}</h1>
          {description && (
            <p className="mt-5 text-[1.05rem] leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>

        {imageUrl && (
          <div className="animate-rise">
            <img
              src={imageUrl}
              alt=""
              className="aspect-[4/3] w-full rounded-[2rem] border border-border/60 object-cover shadow-[0_30px_60px_-40px_rgba(19,37,74,0.55)]"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </section>
  );
}
