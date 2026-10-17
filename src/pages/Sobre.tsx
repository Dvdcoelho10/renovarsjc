import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, Info } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { SectionHeading } from "@/components/site/SectionHeading";
import { AreasGrid } from "@/components/site/AreasGrid";
import { InvitePanel } from "@/components/site/InvitePanel";
import { BibleFlame } from "@/components/brand/Graphics";
import { church } from "@/content/site";
import { usePageTitle } from "@/hooks/use-page-title";

const institutionalData = [
  { label: "Nome", value: church.name },
  { label: "Sigla", value: church.acronym },
  { label: "Fundação", value: church.foundedAt },
  { label: "Origem", value: `${church.city} · ${church.state}` },
  { label: "Natureza", value: church.legalNature },
];

const Sobre = () => {
  usePageTitle("Sobre a igreja");

  return (
    <>
      <PageHeader
        eyebrow="Sobre a igreja"
        title="Uma igreja que nasceu em São José dos Campos"
        description="Conheça a origem, a missão e os princípios que orientam a Igreja Assembleia de Deus Renovar."
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
                A <strong className="font-medium text-foreground">Igreja Assembleia de Deus Renovar</strong>{" "}
                (ADR) é uma associação sem fins lucrativos fundada em{" "}
                {church.foundedAt}, em {church.city}, {church.state}. Sua
                finalidade é proclamar o Evangelho de nosso Senhor e Salvador
                Jesus Cristo.
              </p>
              <p>
                A Bíblia é a referência de fé e a orientação para tudo o que a
                igreja ensina e pratica. É a partir dela que buscamos viver o
                amor a Deus, o cuidado com as pessoas e o compromisso com a
                verdade.
              </p>
              <p>
                A ADR reúne pessoas que compartilham a mesma esperança em Cristo.
                Este site existe para apresentar a igreja com clareza e para
                abrir um caminho de contato com quem deseja conhecê-la.
              </p>
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
              A Escritura orienta a fé, o ensino e a vida da igreja. É dela que
              vem a mensagem que a Assembleia de Deus Renovar anuncia: a
              salvação em Jesus Cristo.
            </p>

            <blockquote className="mt-8 rounded-[1.5rem] border border-border/70 bg-card p-6 sm:p-8">
              <p className="font-serif text-[1.35rem] leading-snug text-primary sm:text-2xl">
                “Proclamar o Evangelho de nosso Senhor e Salvador Jesus Cristo.”
              </p>
              <footer className="mt-4 text-sm text-muted-foreground">
                Finalidade da igreja, conforme o estatuto.
              </footer>
            </blockquote>
          </div>

          <div className="mx-auto w-full max-w-sm rounded-[2rem] bg-card p-6 sm:p-8">
            <BibleFlame />
          </div>
        </div>
      </section>

      {/* História */}
      <section className="container py-16 sm:py-20">
        <SectionHeading
          eyebrow="Nossa história"
          title="O começo, em 2013"
          description="A história da igreja começa na fundação e segue sendo construída pelas pessoas que dela participam."
        />

        <ol className="mt-10 max-w-2xl space-y-8 border-l border-border pl-6 sm:pl-8">
          <li className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-[1.92rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-accent sm:-left-[2.42rem]"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              23 de setembro de 2013
            </p>
            <h3 className="mt-2 text-xl">Fundação da igreja</h3>
            <p className="mt-2 text-[0.98rem] leading-relaxed text-muted-foreground">
              Em {church.city}, {church.state}, a Igreja Assembleia de Deus
              Renovar é constituída como associação sem fins lucrativos, com a
              finalidade de proclamar o Evangelho de Jesus Cristo.
            </p>
          </li>
        </ol>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Outros marcos da história da igreja serão publicados aqui quando
          informados pela liderança.
        </p>
      </section>

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
              Informações sobre ações em andamento, encontros e projetos serão
              publicadas pela liderança quando confirmadas. Até lá, nenhuma
              atividade é apresentada como existente.
            </p>
          </div>
        </div>
      </section>

      {/* Nota sobre o conteúdo */}
      <section className="container py-16 sm:py-20">
        <div className="max-w-3xl rounded-[1.75rem] border border-border/80 bg-card p-6 sm:p-8">
          <h2 className="text-lg">Sobre as informações desta página</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            O conteúdo institucional desta página foi elaborado a partir do
            estatuto da igreja, que orienta a apresentação sem ser reproduzido
            na íntegra. Dados de contato, programação e projetos aparecem
            apenas quando confirmados pela liderança.
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
        title="Quer conhecer a igreja?"
        description="Será uma alegria receber você. Os canais oficiais de contato serão publicados assim que forem confirmados pela liderança."
        primaryLabel="Ir para contato"
        primaryTo="/contato"
        secondaryLabel="Voltar ao início"
        secondaryTo="/"
      />
    </>
  );
};

export default Sobre;
