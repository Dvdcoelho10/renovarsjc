/**
 * Conexão MySQL/MariaDB (Hostinger) com pool e queries parametrizadas.
 *
 * Quando as variáveis DB_* não estão definidas, o site continua funcionando
 * com o conteúdo padrão de src/content/site.ts e as rotas administrativas
 * respondem 503 (db_not_configured) em vez de derrubar o servidor.
 */
import mysql from "mysql2/promise";

let pool = null;
let poolSignature = "";

export function readDbConfig(env = process.env) {
  return {
    host: (env.DB_HOST ?? "").trim(),
    port: Number((env.DB_PORT ?? "3306").trim()) || 3306,
    database: (env.DB_NAME ?? "").trim(),
    user: (env.DB_USER ?? "").trim(),
    password: env.DB_PASSWORD ?? "",
  };
}

export function isDbConfigured(env = process.env) {
  const config = readDbConfig(env);
  return Boolean(config.host && config.database && config.user);
}

export function getPool(env = process.env) {
  if (!isDbConfigured(env)) return null;

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

/** Executa uma query parametrizada e devolve as linhas. */
export async function query(env, sql, params = []) {
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

export async function closePool() {
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
