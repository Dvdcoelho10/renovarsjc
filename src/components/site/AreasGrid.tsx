import { BookOpen, Flame, HeartHandshake } from "lucide-react";

import { useSiteContent } from "@/content/ContentProvider";

const icons = {
  evangelizacao: Flame,
  "educacao-crista": BookOpen,
  "acao-social": HeartHandshake,
} as const;

export function AreasGrid() {
  const { content } = useSiteContent();

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {content.ministryAreas.map((area, index) => {
        const Icon = icons[area.id as keyof typeof icons] ?? Flame;

        return (
          <article
            key={area.id}
            className="group flex h-full flex-col rounded-3xl border border-border/80 bg-card p-6 transition-colors duration-300 hover:border-primary/25 sm:p-7"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <h3 className="mt-6 text-xl">{area.title}</h3>
            <p className="mt-3 flex-1 text-[0.97rem] leading-relaxed text-muted-foreground">
              {area.description}
            </p>
            <p className="mt-6 border-t border-border/70 pt-4 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Prevista no estatuto
            </p>
          </article>
        );
      })}
    </div>
  );
}
