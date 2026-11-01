import { Users } from "lucide-react";

import { SectionHeading } from "@/components/site/SectionHeading";
import { useSiteContent } from "@/content/ContentProvider";

/**
 * Ministérios e líderes. A seção só aparece quando a liderança cadastra ao
 * menos um ministério no painel — não publicamos departamentos supostos.
 */
export function MinistriesSection() {
  const { content } = useSiteContent();
  const { about, ministries } = content;

  if (ministries.length === 0) return null;

  return (
    <section className="container py-16 sm:py-20">
      <SectionHeading
        eyebrow={about.ministriesEyebrow}
        title={about.ministriesTitle}
        description={about.ministriesIntro}
        className="max-w-3xl"
      />

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ministries.map((ministry) => (
          <li
            key={ministry.id}
            className="flex h-full flex-col rounded-[1.75rem] border border-border/80 bg-card p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Users className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            </span>

            <h3 className="mt-5 font-serif text-xl leading-snug text-foreground">
              {ministry.title}
            </h3>

            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent-deep">
              {ministry.leader
                ? `Liderança: ${ministry.leader}`
                : "Liderança a confirmar"}
            </p>

            {ministry.description && (
              <p className="mt-3 text-[0.96rem] leading-relaxed text-muted-foreground">
                {ministry.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
