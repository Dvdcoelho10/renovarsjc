import { getYoutubeChannelId, type YoutubeCopy } from "@/content/site";

export type YoutubeLatestState =
  | { status: "loading" }
  | { status: "ready"; videoId: string; title: string; publishedAt?: string }
  | { status: "empty" }
  | { status: "error" };

const CACHE_PREFIX = "adr-youtube-latest-v2";
const CACHE_TTL_MS = 2 * 60 * 1000;

type PlaylistResponse = {
  items?: {
    contentDetails?: { videoId?: string };
    snippet?: { title?: string; publishedAt?: string };
  }[];
};

function cacheKey(config: YoutubeCopy) {
  return `${config.channel}`;
}

function readCache(config: YoutubeCopy): YoutubeLatestState | null {
  try {
    const raw = window.sessionStorage.getItem(`${CACHE_PREFIX}:${cacheKey(config)}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as { at: number; state: YoutubeLatestState };
    if (Date.now() - entry.at > CACHE_TTL_MS) return null;
    return entry.state;
  } catch {
    return null;
  }
}

function writeCache(config: YoutubeCopy, state: YoutubeLatestState) {
  try {
    window.sessionStorage.setItem(
      `${CACHE_PREFIX}:${cacheKey(config)}`,
      JSON.stringify({ at: Date.now(), state }),
    );
  } catch {
    // Cache é opcional.
  }
}

/**
 * Busca o vídeo mais recente da playlist de uploads do canal.
 * Uma única chamada a playlistItems (1 unidade de cota) por consulta.
 */
export async function fetchLatestVideo(
  config: YoutubeCopy,
  options: { force?: boolean } = {},
): Promise<YoutubeLatestState> {
  const channelId = getYoutubeChannelId(config.channel);
  const apiKey = config.apiKey.trim();
  if (!channelId || !apiKey) return { status: "error" };

  if (!options.force) {
    const cached = readCache(config);
    if (cached) return cached;
  }

  const uploadsPlaylistId = `UU${channelId.slice(2)}`;

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(
        uploadsPlaylistId,
      )}&maxResults=1&key=${encodeURIComponent(apiKey)}`,
    );

    if (!response.ok) {
      return finish(config, { status: "error" });
    }

    const data = (await response.json()) as PlaylistResponse;
    const item = data.items?.[0];
    const videoId = item?.contentDetails?.videoId;

    if (!videoId) {
      return finish(config, { status: "empty" });
    }

    return finish(config, {
      status: "ready",
      videoId,
      title: item?.snippet?.title ?? "",
      publishedAt: item?.snippet?.publishedAt,
    });
  } catch {
    return finish(config, { status: "error" });
  }
}

function finish(config: YoutubeCopy, state: YoutubeLatestState) {
  writeCache(config, state);
  return state;
}
