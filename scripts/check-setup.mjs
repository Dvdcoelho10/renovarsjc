/**
 * Diagnóstico do ambiente de produção (não altera nada).
 *
 *   node scripts/check-setup.mjs
 *
 * Mostra se as variáveis existem (sem exibir valores sensíveis), se o banco
 * responde, se as tabelas da migração estão aplicadas, se há administrador,
 * se o site já tem conteúdo publicado e se SMTP/YouTube estão configurados.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { closePool, isDbConfigured, query, readDbConfig } from "../server/db.mjs";
import { loadServerEnv } from "../server/env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = loadServerEnv(root);

const lines = [];
const ok = (label, value) => lines.push(`  [ok]    ${label}: ${value}`);
const warn = (label, value) => lines.push(`  [aviso] ${label}: ${value}`);
const fail = (label, value) => lines.push(`  [falta] ${label}: ${value}`);

let critical = 0;

lines.push(`Node ${process.version} · raiz ${root}`);
lines.push("");
lines.push("Banco de dados");

const config = readDbConfig(env);
if (!isDbConfigured(env)) {
  fail("DB_HOST / DB_NAME / DB_USER", "não configurados");
  critical += 1;
} else {
  ok("destino", `${config.host}:${config.port}/${config.database}`);
  ok("usuário", config.user);
  ok("senha", config.password ? "definida" : "vazia");

  try {
    await query(env, "SELECT 1");
    ok("conexão", "respondeu");

    const tables = await query(
      env,
      "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE()",
    );
    const names = new Set(tables.map((row) => String(row.name ?? row.NAME ?? "")));

    for (const table of [
      "site_content",
      "admin_users",
      "admin_sessions",
      "login_attempts",
      "media",
    ]) {
      if (names.has(table)) ok("tabela", table);
      else {
        fail("tabela", `${table} ausente — aplique database/migrations/001_admin_content_media.sql`);
        critical += 1;
      }
    }

    if (names.has("admin_users")) {
      const admins = await query(env, "SELECT COUNT(*) AS total FROM admin_users");
      const total = Number(admins[0]?.total ?? 0);
      if (total > 0) ok("administradores", String(total));
      else {
        fail("administradores", "nenhum — rode: pnpm admin:create");
        critical += 1;
      }
    }

    if (names.has("site_content")) {
      const rows = await query(
        env,
        "SELECT LENGTH(payload) AS bytes, updated_at FROM site_content WHERE id = 1 LIMIT 1",
      );
      if (rows[0]) {
        ok("conteúdo publicado", `${Number(rows[0].bytes ?? 0)} bytes desde ${rows[0].updated_at}`);
      } else {
        warn("conteúdo publicado", "nenhum ainda — o site usa o conteúdo padrão");
      }
    }
  } catch (error) {
    fail("conexão", String(error?.code ?? error?.message ?? error));
    critical += 1;
  }
}

lines.push("");
lines.push("E-mail do formulário de contato");
if (env.SMTP_PASSWORD) {
  ok("SMTP", `${env.SMTP_HOST ?? "smtp.hostinger.com"}:${env.SMTP_PORT ?? "465"} · ${env.SMTP_USER ?? ""}`);
  ok("destino", env.CONTACT_TO_EMAIL ?? "(padrão contato@adrenovar.com.br)");
} else {
  warn("SMTP_PASSWORD", "não definida — o formulário responde mail_not_configured");
}

lines.push("");
lines.push("YouTube");
if (env.YOUTUBE_API_KEY) ok("YOUTUBE_API_KEY", "definida");
else warn("YOUTUBE_API_KEY", "não definida — seção do último vídeo indisponível");
ok("YOUTUBE_CHANNEL_ID", env.YOUTUBE_CHANNEL_ID || "(canal padrão do código)");

lines.push("");
lines.push("Build");
if (existsSync(path.join(root, "dist", "index.html"))) ok("dist/", "presente");
else warn("dist/", "ausente — rode: pnpm build");

lines.push("");
console.log(lines.join("\n"));
console.log(
  critical === 0
    ? "Tudo pronto para publicar."
    : `${critical} item(ns) bloqueando a publicação — veja os [falta] acima.`,
);

await closePool();
process.exitCode = critical === 0 ? 0 : 1;
