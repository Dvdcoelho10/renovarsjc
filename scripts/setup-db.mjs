/**
 * Prepara o banco definido no .env para uso no computador:
 *
 *   pnpm db:setup
 *
 * 1. conecta no MySQL/MariaDB (sem escolher banco);
 * 2. cria o banco de DB_NAME com utf8mb4 se ele ainda não existir;
 * 3. aplica todas as migrações de database/migrations (idempotentes);
 * 4. mostra as tabelas encontradas.
 *
 * Não apaga, não recria e não altera nada existente. Também não cria o
 * administrador — isso é feito por `pnpm admin:create`.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import mysql from "mysql2/promise";

import { readDbConfig } from "../server/db.mjs";
import { loadServerEnv } from "../server/env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = loadServerEnv(root);
const config = readDbConfig(env);

const target = `${config.host}:${config.port}`;
const database = config.database.replace(/`/g, "");

if (!config.host || !database || !config.user) {
  console.error(
    [
      "Faltam dados do banco no arquivo .env.",
      "",
      "  DB_HOST=127.0.0.1",
      "  DB_PORT=3306",
      "  DB_NAME=renovar",
      "  DB_USER=root",
      "  DB_PASSWORD=",
      "",
      "Preencha, salve e rode de novo: pnpm db:setup",
    ].join("\n"),
  );
  process.exit(1);
}

function fail(message, error) {
  console.error(message);
  if (error) {
    console.error(`Detalhe: ${error.code ?? error.message ?? String(error)}`);
  }
  process.exitCode = 1;
}

let server;
try {
  server = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    connectTimeout: 10000,
  });
} catch (error) {
  fail(
    [
      `Não foi possível conectar no MySQL em ${target}.`,
      "",
      "Confira:",
      "  1. o serviço do MySQL/MariaDB está rodando? (XAMPP: botão Start em MySQL)",
      "  2. DB_HOST/DB_PORT do .env batem com o servidor local?",
      "  3. DB_USER/DB_PASSWORD são de um usuário com permissão de criar banco?",
    ].join("\n"),
    error,
  );
  process.exit(1);
}

try {
  const [existing] = await server.query(
    "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?",
    [database],
  );

  if (existing.length === 0) {
    await server.query(
      `CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`Banco "${database}" criado.`);
  } else {
    console.log(`Banco "${database}" já existia.`);
  }
} catch (error) {
  fail(`Não foi possível criar o banco "${database}".`, error);
  await server.end().catch(() => undefined);
  process.exit(1);
}

await server.end().catch(() => undefined);

const migrationsDir = path.join(root, "database", "migrations");
const files = (await readdir(migrationsDir))
  .filter((name) => name.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  fail("Nenhuma migração encontrada em database/migrations.");
  process.exit(1);
}

let db;
try {
  db = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database,
    multipleStatements: true,
    connectTimeout: 10000,
  });
} catch (error) {
  fail(`Conectou no servidor, mas não abriu o banco "${database}".`, error);
  process.exit(1);
}

try {
  for (const file of files) {
    const sql = await readFile(path.join(migrationsDir, file), "utf8");
    await db.query(sql);
    console.log(`Migração aplicada: ${file}`);
  }

  const [tables] = await db.query(
    "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = ? ORDER BY table_name",
    [database],
  );
  console.log("");
  console.log(`Tabelas em "${database}":`);
  for (const row of tables) console.log(`  - ${row.name}`);

  const [admins] = await db.query("SELECT COUNT(*) AS total FROM admin_users");
  console.log("");
  if (Number(admins[0]?.total ?? 0) > 0) {
    console.log(`Administradores cadastrados: ${admins[0].total}`);
  } else {
    console.log("Nenhum administrador ainda. Rode: pnpm admin:create");
  }
  console.log("");
  console.log("Pronto. Reinicie o servidor (pnpm dev) e abra /admins.");
} catch (error) {
  fail("Falha ao aplicar as migrações.", error);
} finally {
  await db.end().catch(() => undefined);
}
