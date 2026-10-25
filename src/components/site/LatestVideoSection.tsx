import { RefreshCw, Youtube } from "lucide-react";

import type { GivingCopy, YoutubeCopy } from "@/content/site";
import { useLatestVideo } from "@/hooks/use-latest-video";
import { formatLongDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { GivingCard } from "@/components/site/GivingCard";

export function LatestVideoSection({
  youtube,
  giving,
}: {
  youtube: YoutubeCopy;
  giving: GivingCopy;
}) {
  const { state, refresh } = useLatestVideo(youtube.enabled);
  const showVideo = youtube.enabled;
  const showGiving = giving.enabled && Boolean(giving.qrImageUrl);

  if (!showVideo && !showGiving) return null;

  const sideBySide = showVideo && showGiving;

  return (
    <section
      id="ultimo-video"
      aria-label={showVideo ? "Último vídeo e contribuições" : "Dízimos e ofertas"}
      className="container scroll-mt-24 py-16 sm:py-20"
    >
      <div
        className={cn(
          "grid gap-8 rounded-[2rem] border border-border/80 bg-card p-4 sm:p-6",
          sideBySide && "lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-10",
        )}
      >
        {showVideo && (
          <div className="order-1 px-1 py-2 sm:px-3 lg:order-2 lg:py-4">
            <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
              Canal oficial
            </p>

            <h2 className="mt-4 text-[1.75rem] leading-tight sm:text-4xl">
              {youtube.title}
            </h2>

            <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
              {youtube.description}
            </p>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-border bg-secondary/40 p-1.5">
              {state.status === "ready" ? (
                <iframe
                  title={state.title || youtube.title || "Último vídeo do canal"}
                  src={`https://www.youtube.com/embed/${state.videoId}?rel=0&playsinline=1`}
                  className="aspect-video w-full rounded-[1.15rem]"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-[1.15rem] bg-background px-6 text-center">
                  {state.status === "loading" ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="h-10 w-10 animate-pulse rounded-full bg-secondary"
                      />
                      <p className="text-sm text-muted-foreground">
                        Carregando o vídeo mais recente...
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                        <Youtube
                          className="h-6 w-6"
                          strokeWidth={1.7}
                          aria-hidden="true"
                        />
                      </span>
                      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                        {state.status === "empty"
                          ? "Ainda não há vídeos publicados no canal."
                          : "Não foi possível carregar o vídeo agora. Tente novamente em instantes."}
                      </p>
                      {state.status === "error" && (
                        <button
                          type="button"
                          onClick={refresh}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                        >
                          <RefreshCw className="h-4 w-4" aria-hidden="true" />
                          Tentar novamente
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {state.status === "ready" && (
              <div className="mt-4 rounded-2xl border border-border/70 bg-background/60 p-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Último vídeo publicado
                </p>
                <p className="mt-1.5 font-serif text-[1.05rem] leading-snug text-foreground">
                  {state.title || "Último vídeo publicado"}
                </p>
                {state.publishedAt && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Publicado em {formatLongDate(state.publishedAt)}
                  </p>
                )}
              </div>
            )}

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              O vídeo mais recente do canal é carregado aqui e muda sozinho
              quando uma nova publicação é feita.
            </p>
          </div>
        )}

        {showGiving && (
          <GivingCard
            giving={giving}
            className={cn(
              "order-2 lg:order-1",
              !showVideo && "mx-auto w-full max-w-sm",
            )}
          />
        )}
      </div>
    </section>
  );
}
