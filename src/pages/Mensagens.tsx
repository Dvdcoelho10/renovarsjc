import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Play } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { EmptyStateGraphic } from "@/components/brand/Graphics";
import { Button } from "@/components/ui/button";
import { messages, type MessageKind } from "@/content/site";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/use-page-title";

const kindLabels: Record<MessageKind, string> = {
  reflexao: "Reflexão",
  estudo: "Estudo bíblico",
  video: "Vídeo",
};

type Filter = "todas" | MessageKind;

const filters: { label: string; value: Filter }[] = [
  { label: "Todas", value: "todas" },
  { label: "Reflexões", value: "reflexao" },
  { label: "Estudos", value: "estudo" },
  { label: "Vídeos", value: "video" },
];

const sortedMessages = [...messages].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);

const Mensagens = () => {
  usePageTitle("Mensagens");
  const [filter, setFilter] = useState<Filter>("todas");

  const visible =
    filter === "todas"
      ? sortedMessages
      : sortedMessages.filter((message) => message.kind === filter);

  return (
    <>
      <PageHeader
        eyebrow="Mensagens e conteúdos"
        title="Reflexões, estudos e vídeos da igreja"
        description="Conteúdos publicados pela liderança da Assembleia de Deus Renovar. Nada é publicado sem confirmação da igreja."
      />

      <section className="container py-16 sm:py-20">
        {sortedMessages.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/80 bg-card px-6 py-12 text-center sm:px-10">
            <EmptyStateGraphic className="mx-auto max-w-[15rem]" />
            <h2 className="mt-8 text-[1.5rem] leading-snug sm:text-2xl">
              Ainda não há mensagens publicadas
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[0.98rem] leading-relaxed text-muted-foreground">
              Reflexões, estudos bíblicos e vídeos aparecerão aqui quando forem
              compartilhados pela igreja. Não publicamos pregações, autores ou
              canais oficiais sem confirmação.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-full px-6">
                <Link to="/contato">Falar com a igreja</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-border px-6 hover:bg-secondary"
              >
                <Link to="/">Voltar ao início</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div
              role="group"
              aria-label="Filtrar mensagens por tipo"
              className="flex flex-wrap gap-2"
            >
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  aria-pressed={filter === item.value}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors",
                    filter === item.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <ul className="mt-8 grid gap-5 md:grid-cols-2">
              {visible.map((message) => (
                <li key={message.id}>
                  <article className="flex h-full flex-col rounded-[1.75rem] border border-border/80 bg-card p-6">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-accent-deep">
                      {kindLabels[message.kind]}
                      {" · "}
                      <span className="text-muted-foreground">
                        {formatShortDate(message.publishedAt)}
                      </span>
                    </p>
                    <h2 className="mt-3 text-xl leading-snug">{message.title}</h2>
                    <p className="mt-3 flex-1 text-[0.97rem] leading-relaxed text-muted-foreground">
                      {message.summary}
                    </p>

                    {message.imageUrl && (
                      <img
                        src={message.imageUrl}
                        alt=""
                        className="mt-5 aspect-[16/9] w-full rounded-2xl object-cover"
                        loading="lazy"
                      />
                    )}

                    <div className="mt-5 flex items-center justify-between gap-4 border-t border-border/70 pt-4">
                      <span className="text-sm text-muted-foreground">
                        {message.author ?? "Publicado pela igreja"}
                      </span>
                      {message.videoUrl && (
                        <a
                          href={message.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                        >
                          <Play className="h-4 w-4" aria-hidden="true" />
                          Assistir
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </article>
                </li>
              ))}
            </ul>

            {visible.length === 0 && (
              <p className="mt-8 rounded-2xl border border-dashed border-border bg-card/60 p-6 text-sm text-muted-foreground">
                Nenhum conteúdo deste tipo foi publicado ainda.
              </p>
            )}
          </>
        )}
      </section>
    </>
  );
};

export default Mensagens;
