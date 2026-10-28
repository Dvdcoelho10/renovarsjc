/**
 * Imagens enviadas pelo painel.
 *
 * - POST /api/admin/media   → grava a imagem no banco (exige sessão)
 * - GET  /api/media/{id}    → devolve a imagem (público, cache imutável)
 *
 * O arquivo fica na tabela `media` (LONGBLOB), então sobrevive a build e
 * redeploy — nada é gravado em dist/ nem no disco do app.
 */
import { createHash, randomUUID } from "node:crypto";

import { isJsonRequest, isSameOrigin, readJsonBody, requireAdmin, sendJson } from "./admin-api.mjs";
import { isDbConfigured, query } from "./db.mjs";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_UPLOAD_BODY = 5 * 1024 * 1024;
const DATA_URL = /^data:(image\/(?:webp|png|jpeg));base64,([A-Za-z0-9+/=\s]+)$/;
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Confere os primeiros bytes do arquivo (não confia no que o cliente diz). */
function sniffImageType(buffer) {
  if (buffer.length > 12 && buffer.toString("ascii", 0, 4) === "RIFF") {
    return buffer.toString("ascii", 8, 12) === "WEBP" ? "image/webp" : "";
  }
  if (
    buffer.length > 8 &&
    buffer[0] === 0x89 &&
    buffer.toString("ascii", 1, 4) === "PNG"
  ) {
    return "image/png";
  }
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  return "";
}

export async function handleMediaUploadRequest(req, res, env) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  const session = await requireAdmin(req, res, env);
  if (!session) return;

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
    body = await readJsonBody(req, MAX_UPLOAD_BODY);
  } catch (error) {
    sendJson(res, error?.status ?? 400, { error: error?.code ?? "invalid_payload" });
    return;
  }

  const dataUrl = typeof body?.dataUrl === "string" ? body.dataUrl.trim() : "";
  const match = DATA_URL.exec(dataUrl);
  if (!match) {
    sendJson(res, 400, { error: "invalid_image" });
    return;
  }

  const declared = match[1].toLowerCase();
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");

  if (buffer.length === 0) {
    sendJson(res, 400, { error: "invalid_image" });
    return;
  }
  if (buffer.length > MAX_IMAGE_BYTES) {
    sendJson(res, 413, { error: "image_too_large" });
    return;
  }

  const mime = sniffImageType(buffer);
  if (!mime || mime !== declared) {
    sendJson(res, 400, { error: "invalid_image" });
    return;
  }

  const sha256 = createHash("sha256").update(buffer).digest("hex");

  try {
    const existing = await query(env, "SELECT id FROM media WHERE sha256 = ? LIMIT 1", [sha256]);
    if (existing[0]) {
      sendJson(res, 200, {
        url: `/api/media/${existing[0].id}`,
        mime,
        bytes: buffer.length,
      });
      return;
    }

    const id = randomUUID();
    await query(
      env,
      `INSERT INTO media (id, mime_type, byte_size, sha256, data)
       VALUES (?, ?, ?, ?, ?)`,
      [id, mime, buffer.length, sha256, buffer],
    );

    sendJson(res, 201, { url: `/api/media/${id}`, mime, bytes: buffer.length });
  } catch (error) {
    console.error("[midia] falha ao salvar imagem:", error?.code ?? error?.message);
    sendJson(res, 500, { error: "upload_failed" });
  }
}

export async function handleMediaRequest(req, res, env) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  const pathname = (req.url ?? "").split("?")[0];
  const id = pathname.startsWith("/api/media/") ? pathname.slice("/api/media/".length) : "";

  if (!ID_PATTERN.test(id) || !isDbConfigured(env)) {
    sendJson(res, 404, { error: "not_found" });
    return;
  }

  try {
    const rows = await query(
      env,
      "SELECT mime_type, data FROM media WHERE id = ? LIMIT 1",
      [id],
    );
    const row = rows[0];

    if (!row || !row.data) {
      sendJson(res, 404, { error: "not_found" });
      return;
    }

    const buffer = Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data);

    res.statusCode = 200;
    res.setHeader("Content-Type", row.mime_type);
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    if (req.method === "HEAD") {
      res.end();
      return;
    }

    res.end(buffer);
  } catch (error) {
    console.error("[midia] falha ao servir imagem:", error?.code ?? error?.message);
    sendJson(res, 500, { error: "internal_error" });
  }
}
