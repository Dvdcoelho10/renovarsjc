/**
 * Rotas de autenticação do painel (/api/admin/*).
 *
 * - POST /api/admin/login    → valida e-mail/senha, cria sessão no cookie HttpOnly
 * - POST /api/admin/logout   → encerra a sessão
 * - GET  /api/admin/session  → informa se o navegador tem sessão válida
 *
 * As rotas de escrita do painel usam `requireAdmin()`.
 */
import {
  clearedHintCookie,
  clearedSessionCookie,
  clientIp,
  destroySession,
  findSession,
  hintCookie,
  isSecureRequest,
  login,
  readCookie,
  SESSION_COOKIE,
  sessionCookie,
} from "./auth.mjs";
import { isDbConfigured } from "./db.mjs";

const MAX_JSON_BYTES = 8 * 1024;

export function sendJson(res, status, body, cacheControl = "no-store") {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cacheControl);
  res.end(JSON.stringify(body));
}

export async function readJsonBody(req, limit = MAX_JSON_BYTES) {
  let size = 0;
  const chunks = [];

  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) {
      const error = new Error("payload_too_large");
      error.code = "payload_too_large";
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    const error = new Error("invalid_payload");
    error.code = "invalid_payload";
    error.status = 400;
    throw error;
  }
}

function headerValue(req, name) {
  const value = req.headers[name];
  return String(Array.isArray(value) ? value[0] : (value ?? ""));
}

/** Bloqueia escritas feitas por outros sites (CSRF), exigindo mesma origem. */
export function isSameOrigin(req) {
  const origin = headerValue(req, "origin");

  // Navegadores modernos informam a origem; quando ela não vem, usamos o
  // cabeçalho Sec-Fetch-Site para não quebrar clientes legítimos.
  if (!origin) return headerValue(req, "sec-fetch-site") === "same-origin";

  try {
    const originHost = new URL(origin).host;
    const host = headerValue(req, "x-forwarded-host") || headerValue(req, "host");
    return Boolean(host) && originHost === host.split(",")[0].trim();
  } catch {
    return false;
  }
}

export function isJsonRequest(req) {
  return headerValue(req, "content-type").toLowerCase().includes("application/json");
}

/**
 * Valida a sessão para rotas administrativas.
 * Devolve a sessão ou null (já respondendo 401/503 quando for o caso).
 */
export async function requireAdmin(req, res, env) {
  if (!isDbConfigured(env)) {
    sendJson(res, 503, { error: "db_not_configured" });
    return null;
  }

  try {
    const session = await findSession(env, readCookie(req, SESSION_COOKIE));
    if (!session) {
      sendJson(res, 401, { error: "unauthorized" });
      return null;
    }
    return session;
  } catch (error) {
    console.error("[admin] falha ao validar sessão:", error?.code ?? error?.message);
    sendJson(res, 500, { error: "internal_error" });
    return null;
  }
}

export async function handleAdminLoginRequest(req, res, env) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }
  if (!isDbConfigured(env)) {
    sendJson(res, 503, { error: "db_not_configured" });
    return;
  }
  if (!isSameOrigin(req)) {
    sendJson(res, 403, { error: "invalid_origin" });
    return;
  }
  if (!isJsonRequest(req)) {
    sendJson(res, 415, { error: "unsupported_media_type" });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    sendJson(res, error?.status ?? 400, { error: error?.code ?? "invalid_payload" });
    return;
  }

  const email = typeof body?.email === "string" ? body.email.trim().slice(0, 190) : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || password.length === 0 || password.length > 200) {
    sendJson(res, 400, { error: "invalid_payload" });
    return;
  }

  try {
    const result = await login(env, {
      email,
      password,
      ip: clientIp(req),
      userAgent: req.headers["user-agent"],
    });

    if (result.error === "rate_limited") {
      res.setHeader("Retry-After", "900");
      sendJson(res, 429, { error: "rate_limited" });
      return;
    }
    if (result.error) {
      sendJson(res, 401, { error: "invalid_credentials" });
      return;
    }

    const secure = isSecureRequest(req);
    res.setHeader("Set-Cookie", [
      sessionCookie(result.token, { secure }),
      hintCookie({ secure }),
    ]);
    sendJson(res, 200, { ok: true, user: result.user });
  } catch (error) {
    console.error("[admin] falha no login:", error?.code ?? error?.message);
    sendJson(res, 500, { error: "internal_error" });
  }
}

export async function handleAdminLogoutRequest(req, res, env) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }
  if (!isSameOrigin(req)) {
    sendJson(res, 403, { error: "invalid_origin" });
    return;
  }

  try {
    if (isDbConfigured(env)) {
      await destroySession(env, readCookie(req, SESSION_COOKIE));
    }
  } catch (error) {
    console.error("[admin] falha no logout:", error?.code ?? error?.message);
  }

  const secure = isSecureRequest(req);
  res.setHeader("Set-Cookie", [
    clearedSessionCookie({ secure }),
    clearedHintCookie({ secure }),
  ]);
  sendJson(res, 200, { ok: true });
}

export async function handleAdminSessionRequest(req, res, env) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }
  if (!isDbConfigured(env)) {
    sendJson(res, 200, { authenticated: false, error: "db_not_configured" });
    return;
  }

  try {
    const session = await findSession(env, readCookie(req, SESSION_COOKIE));
    if (!session) {
      sendJson(res, 200, { authenticated: false });
      return;
    }

    sendJson(res, 200, {
      authenticated: true,
      user: { email: session.email },
    });
  } catch (error) {
    console.error("[admin] falha na sessão:", error?.code ?? error?.message);
    sendJson(res, 500, { authenticated: false, error: "internal_error" });
  }
}
