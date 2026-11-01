/**
 * Acesso a dados do servidor.
 *
 * Dois drivers:
 *
 *  - `mysql` (padrão) — MySQL/MariaDB da Hostinger, lido de DB_*.
 *  - `sqlite` (`DB_DRIVER=sqlite`) — arquivo local em DB_FILE, sem servidor e
 *    sem senha. Serve para rodar o painel no computador antes de publicar.
 *
 * O SQL dos módulos é escrito para funcionar nos dois motores: sem NOW(),
 * sem DATE_ADD/DATE_SUB e sem ON DUPLICATE KEY UPDATE (as datas vão como
 * parâmetro, geradas aqui em UTC).
 */
import { mkdirSync } from "node:fs";
import path from "node:path";

import mysql from "mysql2/promise";

export const REQUIRED_DB_KEYS = ["DB_HOST", "DB_NAME", "DB_USER"];

const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS site_content (
  id INTEGER PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_by TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES admin_users (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx ON admin_sessions (expires_at);

CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  identifier_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  succeeded INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS login_attempts_identifier_idx
  ON login_attempts (identifier_hash, created_at);
CREATE INDEX IF NOT EXISTS login_attempts_ip_idx
  ON login_attempts (ip_hash, created_at);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  mime_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL,
  sha256 TEXT NOT NULL UNIQUE,
  data BLOB NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

let pool = null;
let poolSignature = "";
let sqlite = null;
let sqlitePath = "";

export function readDbConfig(env = process.env) {
  return {
    host: (env.DB_HOST ?? "").trim(),
    port: Number((env.DB_PORT ?? "3306").trim()) || 3306,
    database: (env.DB_NAME ?? "").trim(),
    user: (env.DB_USER ?? "").trim(),
    password: env.DB_PASSWORD ?? "",
  };
}

/** "sqlite" ou "mysql" (padrão, para produção). */
export function readDbDriver(env = process.env) {
  return String(env.DB_DRIVER ?? "").trim().toLowerCase() === "sqlite" ? "sqlite" : "mysql";
}

export function readSqliteFile(env = process.env) {
  const file = String(env.DB_FILE ?? "").trim() || "data/dev.sqlite";
  return path.resolve(process.cwd(), file);
}

/** Data local no formato aceito por DATETIME (MySQL) e TEXT (SQLite). UTC. */
export function sqlTimestamp(date = new Date()) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

/** Descrição do destino para logs e diagnóstico (nunca inclui a senha). */
export function describeTarget(env = process.env) {
  if (readDbDriver(env) === "sqlite") return `arquivo ${readSqliteFile(env)}`;
  const config = readDbConfig(env);
  return `${config.host}:${config.port}/${config.database}`;
}

/** Chaves sem as quais não há conexão (senha vazia é aceita: root local). */
export function isDbConfigured(env = process.env) {
  if (readDbDriver(env) === "sqlite") return true;

  const config = readDbConfig(env);
  return Boolean(config.host && config.database && config.user);
}

/** Nomes das variáveis ausentes, para a mensagem de erro do painel. */
export function missingDbKeys(env = process.env) {
  if (readDbDriver(env) === "sqlite") return [];
  return REQUIRED_DB_KEYS.filter((key) => !String(env[key] ?? "").trim());
}

export function getPool(env = process.env) {
  if (!isDbConfigured(env)) return null;
  if (readDbDriver(env) === "sqlite") return null;

  const config = readDbConfig(env);
  const signature = `${config.host}:${config.port}/${config.database}/${config.user}`;

  if (pool && signature === poolSignature) return pool;
  if (pool) void pool.end().catch(() => undefined);

  pool = mysql.createPool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 10000,
    charset: "utf8mb4",
    enableKeepAlive: true,
  });
  poolSignature = signature;

  return pool;
}

/** Abre (e prepara) o arquivo SQLite local. O schema é criado se faltar. */
async function openSqlite(env) {
  const file = readSqliteFile(env);
  if (sqlite && sqlitePath === file) return sqlite;

  if (sqlite) {
    try {
      sqlite.close();
    } catch {
      // arquivo já fechado: nada a fazer
    }
    sqlite = null;
  }

  let DatabaseSync;
  try {
    ({ DatabaseSync } = await import("node:sqlite"));
  } catch (error) {
    const failure = new Error(
      "Este Node não tem o módulo node:sqlite. Use Node 22.5+ (o projeto pede >=22) ou troque DB_DRIVER para mysql.",
    );
    failure.code = "sqlite_unavailable";
    failure.cause = error;
    throw failure;
  }

  mkdirSync(path.dirname(file), { recursive: true });

  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec(SQLITE_SCHEMA);

  sqlite = db;
  sqlitePath = file;
  return db;
}

function normalizeParam(value) {
  if (value === undefined) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  return value;
}

function isReadStatement(sql) {
  return /^\s*(select|pragma|with)\b/i.test(sql);
}

/**
 * Executa uma query e devolve as linhas (SELECT) ou um objeto com
 * `affectedRows`/`insertId` (escritas) — igual nos dois drivers.
 */
export async function query(env, sql, params = []) {
  if (readDbDriver(env) === "sqlite") {
    const db = await openSqlite(env);
    const statement = db.prepare(sql);
    const args = params.map(normalizeParam);

    if (isReadStatement(sql)) return statement.all(...args);

    const info = statement.run(...args);
    return [
      {
        affectedRows: Number(info.changes ?? 0),
        insertId: Number(info.lastInsertRowid ?? 0),
      },
    ];
  }

  const active = getPool(env);
  if (!active) {
    const error = new Error("db_not_configured");
    error.code = "db_not_configured";
    error.status = 503;
    throw error;
  }

  const [rows] = await active.execute(sql, params);
  return rows;
}

/** Igual a `query()`, mas sempre devolve `{ affectedRows, insertId }`. */
export async function run(env, sql, params = []) {
  if (readDbDriver(env) === "sqlite") {
    const db = await openSqlite(env);
    const info = db.prepare(sql).run(...params.map(normalizeParam));
    return {
      affectedRows: Number(info.changes ?? 0),
      insertId: Number(info.lastInsertRowid ?? 0),
    };
  }

  const active = getPool(env);
  if (!active) {
    const error = new Error("db_not_configured");
    error.code = "db_not_configured";
    error.status = 503;
    throw error;
  }

  const [result] = await active.execute(sql, params);
  return {
    affectedRows: Number(result?.affectedRows ?? 0),
    insertId: Number(result?.insertId ?? 0),
  };
}

/** Nomes das tabelas existentes no banco em uso. */
export async function listTables(env = process.env) {
  if (readDbDriver(env) === "sqlite") {
    const rows = await query(
      env,
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
    );
    return rows.map((row) => String(row.name ?? "")).filter(Boolean);
  }

  const rows = await query(
    env,
    "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE()",
  );
  return rows.map((row) => String(row.name ?? row.NAME ?? "")).filter(Boolean);
}

export async function closePool() {
  if (sqlite) {
    try {
      sqlite.close();
    } catch {
      // já fechado
    }
    sqlite = null;
    sqlitePath = "";
  }

  if (!pool) return;
  const active = pool;
  pool = null;
  poolSignature = "";
  await active.end().catch(() => undefined);
}

export async function pingDb(env = process.env) {
  if (!isDbConfigured(env)) return { ok: false, code: "db_not_configured" };
  try {
    await query(env, "SELECT 1");
    return { ok: true };
  } catch (error) {
    return { ok: false, code: error?.code ?? "db_error" };
  }
}

/**
 * Verdadeiro quando o erro veio do banco (serviço fora do ar, senha errada,
 * banco ou tabela inexistente) e não de um bug do código.
 */
export function isDbError(error) {
  const code = String(error?.code ?? "");
  if (!code) return false;

  return (
    code.startsWith("ER_") ||
    code.startsWith("PROTOCOL_") ||
    code.startsWith("SQLITE_") ||
    [
      "ECONNREFUSED",
      "ENOTFOUND",
      "ETIMEDOUT",
      "EHOSTUNREACH",
      "ECONNRESET",
      "EPIPE",
    ].includes(code)
  );
}
