import { UserRound } from "lucide-react";

import { SectionHeading } from "@/components/site/SectionHeading";
import { useSiteContent } from "@/content/ContentProvider";

/**
 * Pastores e pastoras na página Sobre. Nomes vêm do painel; biografias e fotos
 * só aparecem quando a liderança preenche — nada é escrito sem a igreja.
 */
export function PastorsSection() {
  const { content } = useSiteContent();
  const { about, pastors } = content;

  if (pastors.length === 0) return null;

  const hasBio = pastors.some((person) => person.bio.trim().length > 0);

  return (
    <section className="border-y border-border/70 bg-secondary/35 py-16 sm:py-20">
      <div className="container">
        <SectionHeading
          eyebrow={about.pastorsEyebrow}
          title={about.pastorsTitle}
          description={about.pastorsIntro}
          className="max-w-3xl"
        />

        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {pastors.map((person) => (
            <li
              key={person.id}
              className="rounded-[1.75rem] border border-border/80 bg-card p-6 sm:p-7"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-primary">
                  {person.photoUrl ? (
                    <img
                      src={person.photoUrl}
                      alt={`Retrato de ${person.name}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <UserRound
                      className="h-6 w-6"
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  )}
                </span>

                <div className="min-w-0">
                  {person.role && (
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-accent-deep">
                      {person.role}
                    </p>
                  )}
                  <h3 className="mt-1 font-serif text-xl leading-snug text-foreground">
                    {person.name}
                  </h3>
                </div>
              </div>

              {person.bio.trim() && (
                <p className="mt-4 whitespace-pre-line text-[0.97rem] leading-relaxed text-muted-foreground">
                  {person.bio}
                </p>
              )}
            </li>
          ))}
        </ul>

        {!hasBio && (
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            A história de cada pastor será publicada aqui pela liderança da
            igreja.
          </p>
        )}
      </div>
    </section>
  );
}
