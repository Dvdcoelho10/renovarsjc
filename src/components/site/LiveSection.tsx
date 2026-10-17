import { ArrowUpRight } from "lucide-react";

import {
  getYoutubeChannelId,
  getYoutubeVideoId,
  type YoutubeCopy,
} from "@/content/site";

export function LiveSection({ youtube }: { youtube: YoutubeCopy }) {
  const videoId = getYoutubeVideoId(youtube.videoUrl);
  const channelId = getYoutubeChannelId(youtube.channel);

  const embedSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?rel=0`
    : channelId
      ? `https://www.youtube.com/embed/live_stream?channel=${channelId}`
      : "";

  if (!embedSrc) return null;

  const watchUrl =
    youtube.channelUrl ||
    (videoId
      ? `https://www.youtube.com/watch?v=${videoId}`
      : `https://www.youtube.com/channel/${channelId}`);

  return (
    <section id="ao-vivo" className="container scroll-mt-24 py-16 sm:py-20">
      <div className="grid gap-8 rounded-[2rem] border border-border/80 bg-card p-4 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10">
        <div className="px-2 py-4 sm:px-4 lg:py-6">
          <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
            Ao vivo
          </p>
          <h2 className="mt-4 text-[1.75rem] leading-tight sm:text-4xl">
            {youtube.title}
          </h2>
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
            O player exibe a transmissão do canal. Quando não há transmissão no
            momento, o próprio YouTube mostra o aviso.
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-secondary/40 p-1.5">
          <iframe
            title={youtube.title || "Transmissão ao vivo"}
            src={embedSrc}
            className="aspect-video w-full rounded-[1.15rem]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </section>
  );
}
