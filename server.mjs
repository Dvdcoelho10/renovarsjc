/**
 * Servidor de produção: serve o build estático (dist/) e as rotas de API
 * (/api/youtube/latest e /api/contact).
 *
 * Credenciais vêm apenas do ambiente: variáveis do hPanel (Hostinger) ou do
 * arquivo .env local, que nunca é versionado.
 *
 * Uso: pnpm build && pnpm start
 */
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { handleContactRequest } from "./server/contact.mjs";
import { handleLatestVideoRequest } from "./server/youtube.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(root, "dist");
const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";

function parseEnvFile(file) {
  const values = {};
  if (!existsSync(file)) return values;

  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }

  return values;
}

const env = { ...parseEnvFile(path.join(root, ".env")), ...process.env };

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

/** Cabeçalhos de segurança aplicados a todas as respostas. */
function applySecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
}

function cacheControlFor(filePath) {
  if (filePath.endsWith(".html")) return "no-cache";
  if (filePath.includes(`${path.sep}assets${path.sep}`)) {
    return "public, max-age=31536000, immutable";
  }
  return "public, max-age=3600";
}

async function serveFile(req, res, filePath) {
  const info = await stat(filePath);
  if (!info.isFile()) throw new Error("not_a_file");

  res.statusCode = 200;
  res.setHeader(
    "Content-Type",
    mimeTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
  );
  res.setHeader("Cache-Control", cacheControlFor(filePath));
  res.setHeader("Content-Length", info.size);

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  const stream = createReadStream(filePath);
  stream.on("error", () => res.destroy());
  stream.pipe(res);
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  applySecurityHeaders(res);

  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (url.pathname === "/api/youtube/latest") {
    await handleLatestVideoRequest(req, res, env);
    return;
  }

  if (url.pathname === "/api/contact") {
    await handleContactRequest(req, res, env);
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    sendJson(res, 404, { error: "not_found" });
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, HEAD");
    res.end("Method Not Allowed");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.statusCode = 400;
    res.end("Bad Request");
    return;
  }

  const relative = path.normalize(pathname).replace(/^([/\\])+/, "");
  const requested = path.resolve(distDir, relative);
  const allowed =
    requested === distDir || requested.startsWith(`${distDir}${path.sep}`);

  if (!allowed) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  try {
    await serveFile(req, res, requested);
    return;
  } catch {
    // Arquivos inexistentes caem no index.html (React Router).
  }

  try {
    await serveFile(req, res, path.join(distDir, "index.html"));
  } catch {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Build não encontrado. Rode `pnpm build` antes de iniciar.");
  }
});

server.listen(port, host, () => {
  console.log(`[server] ouvindo em http://${host}:${port}`);
  if (!existsSync(path.join(distDir, "index.html"))) {
    console.warn(
      "[server] pasta dist/ ausente: rode `pnpm build` antes de iniciar o servidor.",
    );
  }
  if (!env.YOUTUBE_API_KEY) {
    console.warn(
      "[youtube] YOUTUBE_API_KEY não configurada: a seção do último vídeo ficará indisponível.",
    );
  }
  if (!env.SMTP_PASSWORD) {
    console.warn(
      "[contato] SMTP_PASSWORD não configurada: o formulário de contato não envia e-mails.",
    );
  }
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    console.log(`[server] encerrando (${signal})`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
