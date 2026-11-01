/**
 * Prepara o banco do .env (não é destrutivo).
 *
 *   pnpm db:setup
 *
 * Com `DB_DRIVER=sqlite` (padrão do ambiente local): cria o arquivo
 * `data/dev.sqlite` e o schema completo. Sem servidor e sem senha.
 *
 * Com MySQL/MariaDB: conecta no servidor, cria o banco de DB_NAME em utf8mb4
 * se faltar e aplica as migrações de database/migrations (idempotentes).
 *
 * Em nenhum dos casos cria administrador — isso é `pnpm admin:create`.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import mysql from "mysql2/promise";

import {
  closePool,
  describeTarget,
  listTables,
  query,
  readDbConfig,
  readDbDriver,
  readSqliteFile,
  sqlTimestamp,
} from "../server/db.mjs";
import { loadServerEnv } from "../server/env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = loadServerEnv(root);
const driver = readDbDriver(env);

/** Traduz o código do MySQL para o que precisa ser corrigido. */
const dbErrorHints = {
  ER_ACCESS_DENIED_ERROR:
    "o servidor respondeu e recusou o usuário/senha — revise DB_USER e DB_PASSWORD",
  ER_DBACCESS_DENIED_ERROR:
    "o usuário não tem permissão neste banco — libere o acesso no phpMyAdmin",
  ECONNREFUSED: "nada escutando nesse host/porta — o MySQL está iniciado?",
  ETIMEDOUT: "tempo esgotado — porta errada, firewall ou host remoto bloqueado",
  ENOTFOUND: "DB_HOST não resolve — confira o endereço no .env",
  EHOSTUNREACH: "o host do banco não está acessível a partir desta máquina",
};

async function report() {
  const tables = await listTables(env);
  console.log("");
  console.log(`Tabelas em ${describeTarget(env)}:`);
  for (const table of tables) console.log(`  - ${table}`);

  const admins = await query(env, "SELECT COUNT(*) AS total FROM admin_users");
  const total = Number(admins[0]?.total ?? 0);
  console.log("");
  if (total > 0) console.log(`Administradores cadastrados: ${total}`);
  else console.log("Nenhum administrador ainda. Rode: pnpm admin:create");
  console.log("");
  console.log("Pronto. Reinicie o servidor (pnpm dev) e abra /admins.");
}

if (driver === "sqlite") {
  console.log(`Banco local SQLite: ${readSqliteFile(env)}`);

  try {
    // A primeira query abre o arquivo e cria o schema completo, se faltar.
    await query(env, "SELECT 1");
    console.log("Schema verificado (CREATE TABLE IF NOT EXISTS).");
    await report();
  } catch (error) {
    console.error("Não foi possível preparar o banco SQLite.");
    console.error(`Detalhe: ${error?.code ?? error?.message ?? String(error)}`);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
} else {
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
    const hint = dbErrorHints[String(error?.code ?? "")];
    console.error(`Não foi possível conectar no MySQL em ${target}.`);
    if (hint) console.error(`Motivo: ${hint}`);
    console.error(`Detalhe: ${error?.code ?? error?.message ?? String(error)}`);
    console.error(
      [
        "",
        "Alternativas:",
        "  1. conferir DB_USER/DB_PASSWORD com o administrador do MySQL;",
        "  2. usar o banco local em arquivo: DB_DRIVER=sqlite no .env e rodar de novo.",
      ].join("\n"),
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
    console.error(`Não foi possível criar o banco "${database}".`);
    console.error(`Detalhe: ${error?.code ?? error?.message ?? String(error)}`);
    await server.end().catch(() => undefined);
    process.exit(1);
  }

  await server.end().catch(() => undefined);

  const migrationsDir = path.join(root, "database", "migrations");
  const files = (await readdir(migrationsDir))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.error("Nenhuma migração encontrada em database/migrations.");
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
    console.error(`Conectou no servidor, mas não abriu o banco "${database}".`);
    console.error(`Detalhe: ${error?.code ?? error?.message ?? String(error)}`);
    process.exit(1);
  }

  try {
    for (const file of files) {
      const sql = await readFile(path.join(migrationsDir, file), "utf8");
      await db.query(sql);
      console.log(`Migração aplicada: ${file}`);
    }
    console.log(`Concluído em ${sqlTimestamp()}.`);
  } catch (error) {
    console.error("Falha ao aplicar as migrações.");
    console.error(`Detalhe: ${error?.code ?? error?.message ?? String(error)}`);
    process.exitCode = 1;
  } finally {
    await db.end().catch(() => undefined);
    await closePool();
  }

  if (!process.exitCode) {
    try {
      await report();
    } catch (error) {
      console.error(`Não foi possível relatar o estado do banco: ${error?.message ?? error}`);
    }
    await closePool();
  }
}
