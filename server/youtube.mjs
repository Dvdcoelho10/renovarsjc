/**
 * Consulta o vídeo mais recente da playlist de uploads do canal.
 * Executa apenas no servidor: a chave da API vem do ambiente (.env ou hPanel).
 *
 * Toda falha fica registrada em `getYoutubeStatus()` (código, motivo devolvido
 * pelo Google e horário), para o painel mostrar a causa real em vez de um
 * "não foi possível carregar" genérico.
 */
import { requireAdmin, sendJson } from "./admin-api.mjs";

const DEFAULT_CHANNEL_ID = "UCpnq0C4PXHGSIV2mjNAVrBw";
const CACHE_TTL_MS = 60 * 1000;
/** Falha é reaproveitada por 30 s para não gastar cota a cada visita. */
const ERROR_CACHE_TTL_MS = 30 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
/** Intervalo mínimo entre atualizações forçadas do mesmo IP (protege a cota). */
const FORCE_INTERVAL_MS = 5000;

const cache = new Map();
const errorCache = new Map();
const forceHits = new Map();

/** Último resultado (sucesso ou falha) da consulta ao YouTube. */
let lastAttempt = null;

export function getYoutubeStatus() {
  return lastAttempt;
}

function remember(entry) {
  lastAttempt = { at: new Date().toISOString(), ...entry };
}

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

/** Configuração sem a chave — pode ir para o painel e para /api/health. */
export function describeYoutubeConfig(env = process.env) {
  const config = resolveConfig(env);
  return {
    channelId: config.channelId,
    playlistId: config.playlistId,
    keyConfigured: Boolean(config.apiKey),
  };
}

function fail(code, status, extra = {}) {
  const error = new Error(code);
  error.code = code;
  error.status = status;
  Object.assign(error, extra);
  throw error;
}

export async function getLatestVideo(env, options = {}) {
  const config = resolveConfig(env);

  if (!config.apiKey) {
    remember({ ok: false, error: "missing_api_key" });
    fail("missing_api_key", 503);
  }

  if (!options.force) {
    const cached = cache.get(config.playlistId);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.data;
    }

    const failed = errorCache.get(config.playlistId);
    if (failed && Date.now() - failed.at < ERROR_CACHE_TTL_MS) {
      fail(failed.code, failed.status, { reason: failed.reason, detail: failed.detail });
    }
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
    remember({ ok: false, error: "youtube_unreachable" });
    fail("youtube_unreachable", 502);
  }

  if (!response.ok) {
    // O Google devolve o motivo em error.errors[0].reason
    // (keyInvalid, quotaExceeded, playlistNotFound, ipRefererBlocked…).
    let reason = "";
    let detail = "";
    try {
      const body = await response.json();
      reason = String(body?.error?.errors?.[0]?.reason ?? body?.error?.status ?? "");
      detail = String(body?.error?.message ?? "").slice(0, 300);
    } catch {
      // corpo não era JSON: fica só o status HTTP
    }

    const code = "youtube_error";
    const extra = { reason, detail, status: 502, httpStatus: response.status };
    errorCache.set(config.playlistId, { at: Date.now(), code, ...extra });
    remember({ ok: false, error: code, httpStatus: response.status, reason, detail });
    fail(code, 502, extra);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    remember({ ok: false, error: "youtube_invalid_response" });
    fail("youtube_invalid_response", 502);
  }

  const item = payload?.items?.[0];
  const data = {
    videoId: item?.contentDetails?.videoId ?? null,
    title: item?.snippet?.title ?? "",
    publishedAt: item?.snippet?.publishedAt ?? null,
  };

  cache.set(config.playlistId, { at: Date.now(), data });
  errorCache.delete(config.playlistId);
  remember({
    ok: true,
    videoId: data.videoId,
    title: data.title,
    playlistId: config.playlistId,
  });

  return data;
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
    const ip =
      (first ?? "").split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
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
    console.error(
      "[youtube-api]",
      error?.code ?? error,
      error?.reason ?? "",
      error?.detail ?? "",
    );
    sendJson(
      res,
      error?.status ?? 500,
      {
        error: error?.code ?? "internal_error",
        reason: error?.reason ?? undefined,
        detail: error?.detail ?? undefined,
      },
      "no-store",
    );
  }
}

/**
 * GET /api/admin/youtube/check — só para quem está logado no painel.
 * Testa a API agora (ignora cache) e devolve a configuração e o motivo exato.
 */
export async function handleAdminYoutubeCheckRequest(req, res, env = process.env) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "method_not_allowed" }, "no-store");
    return;
  }

  const session = await requireAdmin(req, res, env);
  if (!session) return;

  const config = describeYoutubeConfig(env);

  try {
    const video = await getLatestVideo(env, { force: true });
    sendJson(
      res,
      200,
      { ok: true, config, video, lastAttempt: getYoutubeStatus() },
      "no-store",
    );
  } catch (error) {
    sendJson(
      res,
      200,
      {
        ok: false,
        config,
        error: error?.code ?? "internal_error",
        httpStatus: error?.httpStatus ?? null,
        reason: error?.reason ?? "",
        detail: error?.detail ?? "",
        lastAttempt: getYoutubeStatus(),
      },
      "no-store",
    );
  }
}
