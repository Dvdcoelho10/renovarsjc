import { ArrowUpRight, Youtube } from "lucide-react";

import {
  getYoutubeChannelId,
  getYoutubeVideoId,
  type YoutubeCopy,
} from "@/content/site";
import { useYoutubeLive } from "@/hooks/use-youtube-live";

const statusLabels = {
  loading: "Verificando transmissão",
  live: "Ao vivo agora",
  offline: "Nenhuma transmissão ao vivo agora",
  error: "Transmissão do canal",
} as const;

export function LiveSection({ youtube }: { youtube: YoutubeCopy }) {
  const { state } = useYoutubeLive(youtube);

  const channelId = getYoutubeChannelId(youtube.channel);
  const directVideoId = getYoutubeVideoId(youtube.videoUrl);

  if (!youtube.enabled || (!channelId && !directVideoId)) return null;

  const liveVideoId = state.status === "live" ? state.videoId : undefined;
  const watchUrl =
    youtube.channelUrl ||
    (directVideoId
      ? `https://www.youtube.com/watch?v=${directVideoId}`
      : `https://www.youtube.com/channel/${channelId}`);

  return (
    <section id="ao-vivo" className="container scroll-mt-24 py-16 sm:py-20">
      <div className="grid gap-8 rounded-[2rem] border border-border/80 bg-card p-4 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10">
        <div className="px-2 py-4 sm:px-4 lg:py-6">
          <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
            <span
              aria-hidden="true"
              className={
                state.status === "live"
                  ? "h-2 w-2 rounded-full bg-accent"
                  : "h-2 w-2 rounded-full bg-muted-foreground/40"
              }
            />
            {statusLabels[state.status]}
          </p>

          <h2 className="mt-4 text-[1.75rem] leading-tight sm:text-4xl">
            {youtube.title}
          </h2>

          {state.status === "live" && state.title && (
            <p className="mt-3 font-medium text-foreground">{state.title}</p>
          )}

          <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
            {youtube.description}
          </p>

          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Abrir no YouTube
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {state.status === "live"
              ? "A transmissão é exibida ao vivo diretamente do canal oficial."
              : "Esta área verifica automaticamente o canal e exibe a transmissão quando ela começar."}
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-secondary/40 p-1.5">
          {liveVideoId ? (
            <iframe
              title={state.title || youtube.title || "Transmissão ao vivo"}
              src={`https://www.youtube.com/embed/${liveVideoId}?rel=0`}
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
                    Verificando o canal no YouTube...
                  </p>
                </>
              ) : (
                <>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                    <Youtube className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {state.status === "error"
                      ? "Não foi possível verificar a transmissão agora. Abra o canal no YouTube para assistir."
                      : "Quando o canal estiver ao vivo, a transmissão aparece aqui automaticamente."}
                  </p>
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Abrir canal no YouTube
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
