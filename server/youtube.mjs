/**
 * Consulta o vídeo mais recente da playlist de uploads do canal.
 * Executa apenas no servidor: a chave da API vem do ambiente (.env).
 */

const DEFAULT_CHANNEL_ID = "UCpnq0C4PXHGSIV2mjNAVrBw";
const CACHE_TTL_MS = 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
/** Intervalo mínimo entre atualizações forçadas do mesmo IP (protege a cota). */
const FORCE_INTERVAL_MS = 5000;

const cache = new Map();
const forceHits = new Map();

export function normalizeChannelId(value) {
  const input = (value ?? "").trim();
  if (!input) return "";
  if (/^UC[\w-]{22}$/.test(input)) return input;

  const match = input.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
  return match ? match[1] : "";
}

function resolveConfig(env) {
  const channelId = normalizeChannelId(env.YOUTUBE_CHANNEL_ID) || DEFAULT_CHANNEL_ID;
  const playlistId =
    (env.YOUTUBE_UPLOADS_PLAYLIST_ID ?? "").trim() ||
    `UU${channelId.slice(2)}`;

  return {
    channelId,
    playlistId,
    apiKey: (env.YOUTUBE_API_KEY ?? "").trim(),
  };
}

function fail(code, status) {
  const error = new Error(code);
  error.code = code;
  error.status = status;
  throw error;
}

export async function getLatestVideo(env, options = {}) {
  const config = resolveConfig(env);
  if (!config.apiKey) fail("missing_api_key", 503);

  const cached = cache.get(config.playlistId);
  if (!options.force && cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("playlistId", config.playlistId);
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("key", config.apiKey);

  let response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    fail("youtube_unreachable", 502);
  }

  if (!response.ok) fail("youtube_error", 502);

  let payload;
  try {
    payload = await response.json();
  } catch {
    fail("youtube_invalid_response", 502);
  }

  const item = payload?.items?.[0];
  const data = {
    videoId: item?.contentDetails?.videoId ?? null,
    title: item?.snippet?.title ?? "",
    publishedAt: item?.snippet?.publishedAt ?? null,
  };

  cache.set(config.playlistId, { at: Date.now(), data });
  return data;
}

function sendJson(res, status, body, cacheControl) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cacheControl);
  res.end(JSON.stringify(body));
}

export async function handleLatestVideoRequest(req, res, env = process.env) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(res, 405, { error: "method_not_allowed" }, "no-store");
    return;
  }

  const url = new URL(req.url ?? "/", "http://localhost");
  const force = url.searchParams.get("force") === "1";

  let forced = false;
  if (force) {
    const forwarded = req.headers["x-forwarded-for"];
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const ip = (first ?? "").split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
    const last = forceHits.get(ip) ?? 0;

    if (Date.now() - last > FORCE_INTERVAL_MS) {
      forceHits.set(ip, Date.now());
      if (forceHits.size > 500) {
        const cutoff = Date.now() - FORCE_INTERVAL_MS;
        for (const [key, at] of forceHits) {
          if (at < cutoff) forceHits.delete(key);
        }
      }
      forced = true;
    }
  }

  try {
    const data = await getLatestVideo(env, { force: forced });
    sendJson(res, 200, data, "public, max-age=30");
  } catch (error) {
    console.error("[youtube-api]", error?.code ?? error);
    sendJson(
      res,
      error?.status ?? 500,
      { error: error?.code ?? "internal_error" },
      "no-store",
    );
  }
}
