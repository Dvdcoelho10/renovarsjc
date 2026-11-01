import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, FileText, Info } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { SectionHeading } from "@/components/site/SectionHeading";
import { AreasGrid } from "@/components/site/AreasGrid";
import { CreedSection } from "@/components/site/CreedSection";
import { InvitePanel } from "@/components/site/InvitePanel";
import { MinistriesSection } from "@/components/site/MinistriesSection";
import { PastorsSection } from "@/components/site/PastorsSection";
import { BibleFlame } from "@/components/brand/Graphics";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/content/ContentProvider";
import { usePageTitle } from "@/hooks/use-page-title";

const Sobre = () => {
  usePageTitle("Sobre a igreja");
  const { content } = useSiteContent();
  const { church, about, images, history, links } = content;

  const institutionalData = [
    { label: "Nome", value: church.name },
    { label: "Sigla", value: church.acronym },
    { label: "Fundação", value: church.foundedAt },
    { label: "Origem", value: `${church.city} · ${church.state}` },
    { label: "Natureza", value: church.legalNature },
  ];

  return (
    <>
      <PageHeader
        eyebrow={about.eyebrow}
        title={about.title}
        description={about.description}
        imageUrl={images.aboutHero}
      />

      {/* Quem somos */}
      <section className="container py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_0.9fr] lg:gap-16">
          <div className="max-w-2xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
              Quem somos
            </p>
            <h2 className="mt-3 text-[1.75rem] leading-tight sm:text-4xl">
              Uma comunidade cristã, reunida em torno da Palavra
            </h2>

            <div className="mt-6 space-y-5 text-[1.02rem] leading-relaxed text-muted-foreground">
              <p>
                A <strong className="font-medium text-foreground">{church.name}</strong>{" "}
                ({church.acronym}) é uma associação sem fins lucrativos fundada em{" "}
                {church.foundedAt}, em {church.city}, {church.state}. Sua
                finalidade é proclamar o Evangelho de nosso Senhor e Salvador
                Jesus Cristo.
              </p>
              {about.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-[1.75rem] border border-border/80 bg-card p-6 sm:p-8 lg:sticky lg:top-28">
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Em resumo
            </h2>
            <dl className="mt-6 space-y-4">
              {institutionalData.map((item) => (
                <div key={item.label} className="border-b border-border/60 pb-4 last:border-0 last:pb-0">
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="mt-1 font-serif text-[1.05rem] leading-snug text-foreground">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      {/* Missão e Bíblia */}
      <section className="border-y border-border/70 bg-secondary/35 py-16 sm:py-20">
        <div className="container grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-primary">
              <BookOpen className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-[1.75rem] leading-tight sm:text-4xl">
              A Bíblia como referência de fé
            </h2>
            <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-muted-foreground">
              {about.bibleText}
            </p>

            <blockquote className="mt-8 rounded-[1.5rem] border border-border/70 bg-card p-6 sm:p-8">
              <p className="font-serif text-[1.35rem] leading-snug text-primary sm:text-2xl">
                “Proclamar o Evangelho de nosso Senhor e Salvador Jesus Cristo.”
              </p>
              <footer className="mt-4 text-sm text-muted-foreground">
                Finalidade da igreja, conforme o estatuto.
              </footer>
            </blockquote>

            <h3 className="mt-10 font-serif text-xl leading-snug sm:text-[1.4rem]">
              {about.missionTitle}
            </h3>
            <p className="mt-3 max-w-xl text-[1.02rem] leading-relaxed text-muted-foreground">
              {about.missionBody}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {about.missionNationsNote}
            </p>

            {(links.nationsUrl || links.bibleUrl) && (
              <div className="mt-5 flex flex-wrap gap-3">
                {links.nationsUrl && (
                  <Button asChild className="h-11 rounded-full px-5">
                    <a
                      href={links.nationsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {links.nationsLabel || "Renovar Nações"}
                      <ArrowUpRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                    </a>
                  </Button>
                )}

                {links.bibleUrl && (
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full border-border px-5 hover:bg-card"
                  >
                    <a
                      href={links.bibleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {links.bibleLabel || "Ler a Bíblia on-line"}
                      <ArrowUpRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="mx-auto w-full max-w-sm rounded-[2rem] bg-card p-6 sm:p-8">
            {images.aboutBible ? (
              <img
                src={images.aboutBible}
                alt=""
                className="aspect-[4/3] w-full rounded-[1.5rem] object-cover"
                loading="lazy"
              />
            ) : (
              <BibleFlame />
            )}
          </div>
        </div>
      </section>

      {/* História */}
      <section className="container py-16 sm:py-20">
        <SectionHeading
          eyebrow="Nossa história"
          title={about.historyTitle}
          description={about.historyDescription}
        />

        <ol className="mt-10 max-w-2xl space-y-8 border-l border-border pl-6 sm:pl-8">
          {history.map((milestone) => (
            <li key={milestone.id} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[1.92rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-accent sm:-left-[2.42rem]"
              />
              {milestone.year && (
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {milestone.year}
                </p>
              )}
              <h3 className="mt-2 text-xl">{milestone.title}</h3>
              {milestone.description && (
                <p className="mt-2 text-[0.98rem] leading-relaxed text-muted-foreground">
                  {milestone.description}
                </p>
              )}
            </li>
          ))}
        </ol>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Outros marcos da história da igreja serão publicados aqui quando
          informados pela liderança.
        </p>
      </section>

      {/* Pastores */}
      <PastorsSection />

      {/* Ministérios e líderes */}
      <MinistriesSection />

      {/* Nosso Cremos */}
      <CreedSection />

      {/* Áreas previstas */}
      <section className="border-y border-border/70 bg-secondary/35 py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Áreas previstas no estatuto"
            title="Evangelização, Educação Cristã e Ação Social"
            description="O estatuto prevê três áreas de atuação. A existência de uma área no documento não confirma atividades, departamentos ou projetos em funcionamento."
            className="max-w-3xl"
          />
          <div className="mt-10">
            <AreasGrid />
          </div>
          <div className="mt-8 flex max-w-3xl gap-4 rounded-2xl border border-border/70 bg-card p-5">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent-deep" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {about.areasNote}
            </p>
          </div>
        </div>
      </section>

      {/* Nosso estatuto */}
      <section className="container py-16 sm:py-20">
        <div className="max-w-3xl">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
            {about.statuteEyebrow}
          </p>
          <h2 className="mt-3 text-[1.75rem] leading-tight sm:text-4xl">
            {about.statuteTitle}
          </h2>

          <div className="mt-5 space-y-4 text-[1.02rem] leading-relaxed text-muted-foreground">
            {about.statuteSummary.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-6 flex gap-4 rounded-2xl border border-border/70 bg-card p-5">
            <FileText
              className="mt-0.5 h-5 w-5 shrink-0 text-accent-deep"
              strokeWidth={1.7}
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {about.statuteNote}
            </p>
          </div>

          <Link
            to="/contato"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Falar com a liderança
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Nota sobre o conteúdo */}
      <section className="container pb-16 sm:pb-20">
        <div className="max-w-3xl rounded-[1.75rem] border border-border/80 bg-card p-6 sm:p-8">
          <h2 className="text-lg">Sobre as informações desta página</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {about.contentNote}
          </p>
          <Link
            to="/contato"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Ver canais de contato
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <InvitePanel
        title={about.inviteTitle}
        description={about.inviteDescription}
        primaryLabel="Ir para contato"
        primaryTo="/contato"
        secondaryLabel="Voltar ao início"
        secondaryTo="/"
      />
    </>
  );
};

export default Sobre;
