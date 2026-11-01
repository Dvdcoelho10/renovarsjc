import { UserRound } from "lucide-react";

import { AdminNotice } from "@/components/site/AdminNotice";
import { SectionHeading } from "@/components/site/SectionHeading";
import { useSiteContent } from "@/content/ContentProvider";
import { useAdminSession } from "@/hooks/use-admin-session";

/**
 * Pastores e pastoras na página Sobre. Nomes vêm do painel; biografias e fotos
 * só aparecem quando a liderança preenche — nada é escrito sem a igreja.
 */
export function PastorsSection() {
  const { content } = useSiteContent();
  const { session } = useAdminSession();
  const { about, pastors } = content;

  if (pastors.length === 0) {
    if (session.status !== "authenticated") return null;

    return (
      <section className="container py-10">
        <AdminNotice
          title="Nossos pastores"
          where="Esta seção aparece aqui, logo depois de “Nossa história”."
          path="/admins → aba Sobre → Pastores e pastoras"
        />
      </section>
    );
  }

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
              className="flex h-full flex-col rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[0_20px_44px_-36px_rgba(19,37,74,0.5)] transition-colors hover:border-accent/45 sm:p-7"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-primary ring-1 ring-inset ring-primary/10">
                  {person.photoUrl ? (
                    <img
                      src={person.photoUrl}
                      alt={`Retrato de ${person.name}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <UserRound
                      className="h-7 w-7"
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
                  <h3 className="mt-1 font-serif text-xl leading-snug text-foreground sm:text-[1.4rem]">
                    {person.name}
                  </h3>
                </div>
              </div>

              {person.bio.trim() ? (
                <p className="mt-5 whitespace-pre-line text-[0.97rem] leading-relaxed text-muted-foreground">
                  {person.bio}
                </p>
              ) : session.status === "authenticated" ? (
                <p className="mt-5 rounded-xl border border-dashed border-accent/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  Só você vê · adicione a foto e o texto em{" "}
                  <span className="font-medium text-foreground">
                    /admins → Sobre → Pastores e pastoras
                  </span>
                  .
                </p>
              ) : null}
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
