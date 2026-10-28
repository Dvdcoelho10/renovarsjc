/**
 * Conteúdo compartilhado do site.
 *
 * - GET /api/content          → conteúdo salvo (público, cache curto)
 * - PUT /api/admin/content    → salva o conteúdo (exige sessão administrativa)
 *
 * O payload é o mesmo objeto SiteContent usado pelo frontend
 * (src/content/site.ts), guardado em site_content.payload (JSON).
 */
import { isJsonRequest, isSameOrigin, readJsonBody, requireAdmin, sendJson } from "./admin-api.mjs";
import { isDbConfigured, query } from "./db.mjs";

const MAX_CONTENT_BYTES = 8 * 1024 * 1024;

function parsePayload(value) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value && typeof value === "object" ? value : null;
}

function looksLikeContent(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof value.church === "object" &&
      value.church !== null &&
      typeof value.home === "object" &&
      value.home !== null,
  );
}

export async function handleContentGetRequest(req, res, env) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  if (!isDbConfigured(env)) {
    sendJson(res, 200, { content: null, updatedAt: null, error: "db_not_configured" });
    return;
  }

  try {
    const rows = await query(
      env,
      "SELECT payload, updated_at FROM site_content WHERE id = 1 LIMIT 1",
    );
    const row = rows[0];
    const content = row ? parsePayload(row.payload) : null;

    if (!content) {
      sendJson(res, 200, { content: null, updatedAt: null });
      return;
    }

    sendJson(
      res,
      200,
      { content, updatedAt: row.updated_at ?? null },
      "public, max-age=15, stale-while-revalidate=30",
    );
  } catch (error) {
    console.error("[conteudo] falha ao ler:", error?.code ?? error?.message);
    sendJson(res, 200, { content: null, updatedAt: null, error: "internal_error" });
  }
}

export async function handleContentPutRequest(req, res, env) {
  if (req.method !== "PUT") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  if (!(await requireAdmin(req, res, env))) return;

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
    body = await readJsonBody(req, MAX_CONTENT_BYTES);
  } catch (error) {
    sendJson(res, error?.status ?? 400, { error: error?.code ?? "invalid_payload" });
    return;
  }

  const content = body?.content;
  if (!looksLikeContent(content)) {
    sendJson(res, 400, { error: "invalid_content" });
    return;
  }

  let payload;
  try {
    payload = JSON.stringify(content);
  } catch {
    sendJson(res, 400, { error: "invalid_content" });
    return;
  }

  if (Buffer.byteLength(payload, "utf8") > MAX_CONTENT_BYTES) {
    sendJson(res, 413, { error: "payload_too_large" });
    return;
  }

  try {
    // Compatível com as duas versões da tabela (com ou sem updated_by):
    // gravamos apenas o payload e o updated_at cuida do resto.
    await query(
      env,
      `INSERT INTO site_content (id, payload)
       VALUES (1, ?)
       ON DUPLICATE KEY UPDATE payload = ?`,
      [payload, payload],
    );

    const rows = await query(
      env,
      "SELECT updated_at FROM site_content WHERE id = 1 LIMIT 1",
    );

    sendJson(res, 200, { ok: true, updatedAt: rows[0]?.updated_at ?? null });
  } catch (error) {
    console.error("[conteudo] falha ao salvar:", error?.code ?? error?.message);
    sendJson(res, 500, { error: "save_failed" });
  }
}
