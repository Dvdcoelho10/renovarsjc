/**
 * Cria (ou redefine) o administrador do painel /admins.
 *
 * Uso, na raiz do projeto:
 *   ADMIN_EMAIL=contato@adrenovar.com.br \
 *   ADMIN_PASSWORD='uma-senha-longa-e-unica' \
 *   node scripts/create-admin.mjs
 *
 * Para redefinir a senha de um administrador existente:
 *   ADMIN_RESET=1 ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/create-admin.mjs
 *
 * A senha nunca é exibida nem gravada em texto puro: apenas o hash scrypt.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { hashPassword } from "../server/auth.mjs";
import { closePool, isDbConfigured, query, readDbConfig } from "../server/db.mjs";
import { loadServerEnv } from "../server/env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = loadServerEnv(root);

const email = String(env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = String(env.ADMIN_PASSWORD ?? "");
const reset = String(env.ADMIN_RESET ?? "") === "1";
const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function stop(message, code = 1) {
  console.error(`[create-admin] ${message}`);
  process.exit(code);
}

if (!isDbConfigured(env)) {
  stop(
    "DB_HOST, DB_NAME e DB_USER não estão definidos. Configure no .env (local) ou nas variáveis da Hostinger.",
  );
}
if (!emailPattern.test(email)) {
  stop("ADMIN_EMAIL ausente ou inválido.");
}
if (password.length < 12) {
  stop("ADMIN_PASSWORD precisa ter pelo menos 12 caracteres.");
}
if (password.toLowerCase().includes(email.split("@")[0])) {
  stop("A senha não pode conter o nome do e-mail.");
}

const config = readDbConfig(env);
console.log(`[create-admin] banco ${config.host}:${config.port}/${config.database}`);

try {
  const hash = await hashPassword(password);
  const existing = await query(
    env,
    "SELECT id FROM admin_users WHERE email = ? LIMIT 1",
    [email],
  );

  if (existing.length > 0) {
    if (!reset) {
      stop(
        "Administrador já existe. Rode novamente com ADMIN_RESET=1 para redefinir a senha.",
        2,
      );
    }

    await query(
      env,
      "UPDATE admin_users SET password_hash = ?, is_active = 1 WHERE id = ?",
      [hash, existing[0].id],
    );
    await query(env, "DELETE FROM admin_sessions WHERE user_id = ?", [existing[0].id]);
    console.log(`[create-admin] senha redefinida para ${email}. Sessões antigas encerradas.`);
  } else {
    await query(
      env,
      "INSERT INTO admin_users (email, password_hash, is_active) VALUES (?, ?, 1)",
      [email, hash],
    );
    console.log(`[create-admin] administrador ${email} criado.`);
  }
} catch (error) {
  console.error(`[create-admin] erro: ${error?.code ?? error?.message ?? error}`);
  if (error?.code === "ER_NO_SUCH_TABLE") {
    console.error(
      "[create-admin] aplique database/migrations/001_admin_content_media.sql no phpMyAdmin antes.",
    );
  }
  process.exitCode = 1;
} finally {
  await closePool();
}
