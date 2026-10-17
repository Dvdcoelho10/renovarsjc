export type YoutubeLatestState =
  | { status: "loading" }
  | { status: "ready"; videoId: string; title: string; publishedAt?: string }
  | { status: "empty" }
  | { status: "error" };

const CACHE_PREFIX = "adr-youtube-latest-v3";
const CACHE_TTL_MS = 2 * 60 * 1000;
const ENDPOINT = "/api/youtube/latest";

type LatestVideoResponse = {
  videoId?: string | null;
  title?: string;
  publishedAt?: string | null;
};

function readCache(): YoutubeLatestState | null {
  try {
    const raw = window.sessionStorage.getItem(CACHE_PREFIX);
    if (!raw) return null;
    const entry = JSON.parse(raw) as { at: number; state: YoutubeLatestState };
    if (Date.now() - entry.at > CACHE_TTL_MS) return null;
    return entry.state;
  } catch {
    return null;
  }
}

function writeCache(state: YoutubeLatestState) {
  try {
    window.sessionStorage.setItem(
      CACHE_PREFIX,
      JSON.stringify({ at: Date.now(), state }),
    );
  } catch {
    // Cache é opcional.
  }
}

function finish(state: YoutubeLatestState) {
  writeCache(state);
  return state;
}

/**
 * Pede ao servidor o vídeo mais recente do canal. A chave da YouTube Data API
 * fica no .env do servidor; o navegador nunca a recebe.
 */
export async function fetchLatestVideo(
  options: { force?: boolean } = {},
): Promise<YoutubeLatestState> {
  if (!options.force) {
    const cached = readCache();
    if (cached) return cached;
  }

  try {
    const response = await fetch(`${ENDPOINT}${options.force ? "?force=1" : ""}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return finish({ status: "error" });

    const data = (await response.json()) as LatestVideoResponse;
    if (!data?.videoId) return finish({ status: "empty" });

    return finish({
      status: "ready",
      videoId: data.videoId,
      title: data.title ?? "",
      publishedAt: data.publishedAt ?? undefined,
    });
  } catch {
    return finish({ status: "error" });
  }
}
