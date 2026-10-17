import {
  getYoutubeChannelId,
  getYoutubeVideoId,
  type YoutubeCopy,
} from "@/content/site";

export type YoutubeLiveState = {
  status: "loading" | "live" | "offline" | "error";
  videoId?: string;
  title?: string;
};

const CACHE_PREFIX = "adr-youtube-live-v1";
const LIVE_TTL_MS = 90 * 1000;
const IDLE_TTL_MS = 5 * 60 * 1000;

type CachedEntry = {
  key: string;
  at: number;
  state: YoutubeLiveState;
};

function cacheKey(config: YoutubeCopy) {
  return `${config.channel}|${config.videoUrl}`;
}

function readCache(config: YoutubeCopy): YoutubeLiveState | null {
  try {
    const raw = window.sessionStorage.getItem(`${CACHE_PREFIX}:${cacheKey(config)}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CachedEntry;
    const ttl = entry.state.status === "live" ? LIVE_TTL_MS : IDLE_TTL_MS;
    if (Date.now() - entry.at > ttl) return null;
    return entry.state;
  } catch {
    return null;
  }
}

function writeCache(config: YoutubeCopy, state: YoutubeLiveState) {
  try {
    const entry: CachedEntry = { key: cacheKey(config), at: Date.now(), state };
    window.sessionStorage.setItem(
      `${CACHE_PREFIX}:${cacheKey(config)}`,
      JSON.stringify(entry),
    );
  } catch {
    // Cache é opcional.
  }
}

type PlaylistResponse = {
  items?: { contentDetails?: { videoId?: string } }[];
};

type VideosResponse = {
  items?: {
    id?: string;
    snippet?: { title?: string; liveBroadcastContent?: string };
  }[];
};

/**
 * Consulta a YouTube Data API v3 para saber se o canal está ao vivo.
 * Usa a playlist de uploads + videos.list (2 unidades de cota) em vez de
 * search.list (100 unidades), com cache por sessão.
 */
export async function fetchYoutubeLiveState(
  config: YoutubeCopy,
  options: { force?: boolean } = {},
): Promise<YoutubeLiveState> {
  if (config.videoUrl.trim()) {
    const directVideoId = getYoutubeVideoId(config.videoUrl);
    if (directVideoId) {
      return { status: "live", videoId: directVideoId };
    }
  }

  const channelId = getYoutubeChannelId(config.channel);
  const apiKey = config.apiKey.trim();
  if (!channelId || !apiKey) return { status: "offline" };

  if (!options.force) {
    const cached = readCache(config);
    if (cached) return cached;
  }

  const playlistId = `UU${channelId.slice(2)}`;

  try {
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${encodeURIComponent(
        playlistId,
      )}&maxResults=5&key=${encodeURIComponent(apiKey)}`,
    );
    if (!playlistResponse.ok) return finish(config, { status: "error" });

    const playlist = (await playlistResponse.json()) as PlaylistResponse;
    const videoIds = (playlist.items ?? [])
      .map((item) => item.contentDetails?.videoId)
      .filter((id): id is string => Boolean(id));

    if (videoIds.length === 0) {
      return finish(config, { status: "offline" });
    }

    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIds
        .map(encodeURIComponent)
        .join(",")}&key=${encodeURIComponent(apiKey)}`,
    );
    if (!videosResponse.ok) return finish(config, { status: "error" });

    const videos = (await videosResponse.json()) as VideosResponse;
    const live = (videos.items ?? []).find(
      (video) => video.snippet?.liveBroadcastContent === "live",
    );

    if (live?.id) {
      return finish(config, {
        status: "live",
        videoId: live.id,
        title: live.snippet?.title,
      });
    }

    return finish(config, { status: "offline" });
  } catch {
    return finish(config, { status: "error" });
  }
}

function finish(config: YoutubeCopy, state: YoutubeLiveState) {
  writeCache(config, state);
  return state;
}
