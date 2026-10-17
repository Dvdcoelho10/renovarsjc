import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Bell, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmblemPanel, BibleFlame } from "@/components/brand/Graphics";
import { SectionHeading } from "@/components/site/SectionHeading";
import { AreasGrid } from "@/components/site/AreasGrid";
import { InvitePanel } from "@/components/site/InvitePanel";
import { LatestVideoSection } from "@/components/site/LatestVideoSection";
import { useSiteContent } from "@/content/ContentProvider";
import { getYoutubeChannelId } from "@/content/site";
import { usePageTitle } from "@/hooks/use-page-title";

const Index = () => {
  usePageTitle();
  const { content } = useSiteContent();
  const { church, home, highlights, images, youtube } = content;

  const facts = [
    { label: "Fundação", value: church.foundedAt },
    { label: "Origem", value: `${church.city} · ${church.state}` },
    { label: "Natureza", value: church.legalNature },
  ];

  return (
    <>
      {/* Destaque */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full border border-primary/[0.07]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-28 h-[22rem] w-[22rem] rounded-full border border-primary/[0.07]"
        />

        <div className="container relative grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.8fr] lg:gap-16 lg:py-20">
          <div>
            <p
              className="animate-rise flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary"
              style={{ animationDelay: "40ms" }}
            >
              <span aria-hidden="true" className="h-[2px] w-7 rounded-full bg-accent" />
              {home.heroEyebrow}
            </p>

            <h1
              className="animate-rise mt-5 text-[2.4rem] leading-[1.05] tracking-tight sm:text-6xl lg:text-[3.6rem]"
              style={{ animationDelay: "120ms" }}
            >
              {home.heroGreeting}
              <span className="block text-primary">{home.heroTitle}</span>
            </h1>

            <p
              className="animate-rise mt-6 max-w-xl text-[1.08rem] leading-relaxed text-muted-foreground sm:text-lg"
              style={{ animationDelay: "200ms" }}
            >
              {home.welcome}
            </p>

            <div
              className="animate-rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "280ms" }}
            >
              <Button asChild className="h-12 rounded-full px-7 text-[0.95rem]">
                <Link to="/sobre">
                  Conheça a igreja
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-border bg-card px-7 text-[0.95rem] text-foreground hover:bg-secondary hover:text-foreground"
              >
                <Link to="/contato">Fale com a igreja</Link>
              </Button>
            </div>

            {youtube.enabled && getYoutubeChannelId(youtube.channel) && (
              <a
                href="#ultimo-video"
                className="animate-rise mt-6 inline-flex items-center gap-2.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                style={{ animationDelay: "340ms" }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent-deep">
                  <Play className="h-3 w-3 fill-current" aria-hidden="true" />
                </span>
                Assistir ao último vídeo do canal
              </a>
            )}
          </div>

          <div
            className="animate-rise mx-auto w-full max-w-[20rem] sm:max-w-sm lg:max-w-none"
            style={{ animationDelay: "220ms" }}
          >
            <EmblemPanel className="aspect-[4/5]" imageUrl={images.homeHero} />
          </div>
        </div>
      </section>

      {/* Dados institucionais */}
      <section aria-label="Informações institucionais" className="container">
        <div className="grid gap-6 rounded-[1.75rem] border border-border/80 bg-card p-6 sm:grid-cols-3 sm:gap-0 sm:p-2">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="sm:border-l sm:border-border/70 sm:px-6 sm:py-5 sm:first:border-l-0"
            >
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-accent-deep">
                {fact.label}
              </p>
              <p className="mt-2 font-serif text-[1.05rem] leading-snug text-foreground">
                {fact.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Último vídeo do canal */}
      <LatestVideoSection youtube={youtube} />

      {/* Missão */}
      <section className="container py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
          <div className="rounded-[2rem] bg-secondary/60 p-6 sm:p-10">
            {images.homeMission ? (
              <img
                src={images.homeMission}
                alt=""
                className="aspect-[4/3] w-full rounded-[1.5rem] object-cover"
                loading="lazy"
              />
            ) : (
              <BibleFlame className="mx-auto max-w-[19rem]" />
            )}
            <p className="mt-6 text-center text-sm leading-relaxed text-muted-foreground">
              A Bíblia é a referência de fé e a orientação da igreja.
            </p>
          </div>

          <div>
            <SectionHeading
              eyebrow="Nossa missão"
              title={home.missionTitle}
              description={home.missionLead}
            />
            <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-muted-foreground">
              {home.missionBody}
            </p>
            <Link
              to="/sobre"
              className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Sobre a igreja
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Áreas */}
      <section className="border-y border-border/70 bg-secondary/35 py-20 sm:py-24">
        <div className="container">
          <SectionHeading
            eyebrow="Áreas previstas no estatuto"
            title="O que orienta o nosso serviço"
            description="O estatuto da igreja prevê três áreas de atuação. Nem todas possuem atividades em andamento, e este site não presume que existam."
            className="max-w-3xl"
          />
          <div className="mt-10">
            <AreasGrid />
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            A previsão de uma área no estatuto não significa que já exista um
            departamento ou projeto em funcionamento. Informações sobre ações
            realizadas serão publicadas pela liderança quando confirmadas.
          </p>
        </div>
      </section>

      {/* Destaques */}
      <section className="container py-20 sm:py-24">
        <SectionHeading
          eyebrow="Destaques"
          title="Informações da igreja"
          description="Avisos, comunicados e destaques publicados pela liderança."
        />

        <div className="mt-10">
          {highlights.length === 0 ? (
            <div className="flex flex-col gap-4 rounded-3xl border border-dashed border-border bg-card/60 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-8">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Bell className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div>
                <p className="font-serif text-lg text-foreground">
                  Ainda não há destaques publicados
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Quando a liderança publicar um aviso ou informação, ele
                  aparecerá aqui.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {highlights.map((highlight) => (
                <article
                  key={highlight.id}
                  className="rounded-3xl border border-border/80 bg-card p-7"
                >
                  <h3 className="text-xl">{highlight.title}</h3>
                  <p className="mt-3 text-[0.97rem] leading-relaxed text-muted-foreground">
                    {highlight.description}
                  </p>
                  {highlight.linkUrl && (
                    <a
                      href={highlight.linkUrl}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {highlight.linkLabel || "Saiba mais"}
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Convite */}
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

export default Index;
