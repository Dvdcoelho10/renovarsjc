import { Link, useParams } from "react-router-dom";
import { ArrowUpRight, FileText } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { InvitePanel } from "@/components/site/InvitePanel";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/content/ContentProvider";
import { usePageTitle } from "@/hooks/use-page-title";

function NotFoundBlock() {
  return (
    <section className="container flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
        Página indisponível
      </p>
      <h1 className="mt-4 text-3xl sm:text-4xl">Esta página não está no site</h1>
      <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-muted-foreground">
        O endereço acessado não corresponde a uma página publicada. Ela pode ter
        sido removida do menu pela liderança.
      </p>
      <Button asChild className="mt-8 h-12 rounded-full px-7">
        <Link to="/">Voltar ao início</Link>
      </Button>
    </section>
  );
}

const CustomPage = () => {
  const { slug = "" } = useParams();
  const { content } = useSiteContent();
  const { church, home } = content;

  const page = content.customPages.find((item) => item.slug === slug);

  usePageTitle(page ? page.title : "Página não encontrada");

  if (!page) return <NotFoundBlock />;

  const sections = page.sections.filter(
    (section) => section.heading || section.body,
  );

  return (
    <>
      <PageHeader
        eyebrow={page.eyebrow || "Página da igreja"}
        title={page.title}
        description={page.description}
        imageUrl={page.imageUrl}
      />

      <section className="container py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_0.85fr] lg:gap-16">
          <div className="max-w-2xl">
            {sections.length === 0 ? (
              <div className="flex flex-col gap-4 rounded-[1.75rem] border border-dashed border-border bg-card/60 p-6 sm:flex-row sm:items-start sm:gap-5 sm:p-8">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <FileText className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-serif text-lg text-foreground">
                    Esta página ainda não tem conteúdo publicado
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Os textos serão publicados pela liderança. Enquanto isso,
                    você pode conhecer a igreja e os canais de contato.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-11">
                {sections.map((section, index) => (
                  <article key={section.id}>
                    {section.heading && (
                      <div className="flex items-baseline gap-3">
                        <span className="font-serif text-sm font-semibold tracking-[0.1em] text-accent-deep">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h2 className="text-[1.55rem] leading-snug sm:text-[1.75rem]">
                          {section.heading}
                        </h2>
                      </div>
                    )}
                    {section.body && (
                      <div
                        className={`space-y-4 border-l border-border/70 pl-5 text-[1.02rem] leading-relaxed text-muted-foreground sm:pl-6 ${
                          section.heading ? "mt-4" : ""
                        }`}
                      >
                        {section.body
                          .split(/\n+/)
                          .map((paragraph) => paragraph.trim())
                          .filter(Boolean)
                          .map((paragraph, position) => (
                            <p key={position}>{paragraph}</p>
                          ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="h-fit space-y-5 lg:sticky lg:top-28">
            <div className="rounded-[1.75rem] border border-border/80 bg-card p-6 sm:p-8">
              <h2 className="text-lg">{church.shortName}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {church.missionStatement}
              </p>
              <dl className="mt-5 space-y-3 border-t border-border/60 pt-5 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Fundação
                  </dt>
                  <dd className="mt-1 font-serif text-[1.02rem] text-foreground">
                    {church.foundedAt}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Origem
                  </dt>
                  <dd className="mt-1 font-serif text-[1.02rem] text-foreground">
                    {church.city} · {church.state}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[1.75rem] border border-border/80 bg-secondary/50 p-6">
              <h2 className="text-lg">Precisa falar com a igreja?</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Os canais oficiais de contato ficam na página de contato e são
                publicados apenas quando confirmados pela liderança.
              </p>
              <Link
                to="/contato"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Ir para contato
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <InvitePanel
        title={home.inviteTitle}
        description={home.inviteDescription}
        primaryLabel="Ver canais de contato"
        primaryTo="/contato"
        secondaryLabel="Conheça a igreja"
        secondaryTo="/sobre"
      />
    </>
  );
};

export default CustomPage;
