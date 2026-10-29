/**
 * GET /api/health — diagnóstico de publicação.
 *
 * Responde sem qualquer dado sensível (não mostra host, usuário, senha nem
 * chaves). Serve para responder a duas perguntas em segundos:
 *
 *  1. A Hostinger está executando este servidor Node (e não só o dist/)?
 *  2. O banco e as tabelas da migração estão prontos?
 *
 * Se esta rota devolver HTML (ou 404 do host), o processo Node não está
 * atendendo o domínio — ver DEPLOY.md, seção “/admins não abre”.
 */
import { isDbConfigured, query } from "./db.mjs";

const REQUIRED_TABLES = [
  "site_content",
  "admin_users",
  "admin_sessions",
  "login_attempts",
  "media",
];

const CACHE_MS = 30 * 1000;
let cache = { at: 0, body: null };

async function inspectDatabase(env) {
  if (!isDbConfigured(env)) {
    return { configured: false, connected: false, tables: "not_configured" };
  }

  try {
    await query(env, "SELECT 1");

    const rows = await query(
      env,
      "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE()",
    );
    const existing = new Set(rows.map((row) => String(row.name ?? row.NAME ?? "")));
    const missing = REQUIRED_TABLES.filter((table) => !existing.has(table));

    return {
      configured: true,
      connected: true,
      tables: missing.length === 0 ? "ready" : "missing",
      missingTables: missing,
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      tables: "unknown",
      error: String(error?.code ?? "db_error"),
    };
  }
}

export async function handleHealthRequest(req, res, env) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, HEAD");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "method_not_allowed" }));
    return;
  }

  if (cache.body && Date.now() - cache.at < CACHE_MS) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(cache.body));
    return;
  }

  const body = {
    ok: true,
    server: "renovar",
    node: process.version,
    // Marcadores para saber se o código publicado é o atual.
    features: {
      adminSession: true,
      sharedContent: true,
      mediaStorage: true,
    },
    db: await inspectDatabase(env),
    smtpConfigured: Boolean(env.SMTP_PASSWORD),
    youtubeConfigured: Boolean(env.YOUTUBE_API_KEY),
    checkedAt: new Date().toISOString(),
  };

  cache = { at: Date.now(), body };

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}
