/**
 * Autenticação do painel: hash de senha com scrypt (node:crypto), sessões com
 * token aleatório guardado apenas como SHA-256 no banco e limite de tentativas.
 *
 * Nada aqui é exposto ao navegador: o token viaja só no cookie HttpOnly.
 */
import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

import { query } from "./db.mjs";

const scrypt = promisify(scryptCallback);

const SCRYPT_N = 32768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_BYTES = 64;
const MAX_MEM = 128 * SCRYPT_N * SCRYPT_R * 2; // ~64 MB

export const SESSION_COOKIE = "adr_admin_session";
/**
 * Cookie de "dica" legível pelo JavaScript: só serve para mostrar os atalhos
 * de edição na própria página. Nunca autoriza nada — quem decide é a sessão.
 */
export const HINT_COOKIE = "adr_admin_hint";
export const SESSION_HOURS = 8;

const MAX_FAILURES = 5;
const FAILURE_WINDOW_MINUTES = 15;

export function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

/** Formato: scrypt$N$r$p$saltBase64$hashBase64 */
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password.normalize("NFKC"), salt, KEY_BYTES, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: MAX_MEM,
  });

  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64"),
    derived.toString("base64"),
  ].join("$");
}

export async function verifyPassword(password, stored) {
  const parts = String(stored ?? "").split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) {
    return false;
  }

  const salt = Buffer.from(parts[4], "base64");
  const expected = Buffer.from(parts[5], "base64");
  if (salt.length === 0 || expected.length === 0) return false;

  try {
    const derived = await scrypt(password.normalize("NFKC"), salt, expected.length, {
      N,
      r,
      p,
      maxmem: Math.max(MAX_MEM, 128 * N * r * 2),
    });
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/** Hash descartável para gastar o mesmo tempo quando o e-mail não existe. */
let dummyHashPromise = null;
function dummyHash() {
  dummyHashPromise ??= hashPassword(randomBytes(24).toString("hex"));
  return dummyHashPromise;
}

export function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const candidate = (first ?? "").split(",")[0].trim();
  return candidate || req.socket?.remoteAddress || "unknown";
}

export function isSecureRequest(req) {
  if (req.socket?.encrypted) return true;
  const proto = String(req.headers["x-forwarded-proto"] ?? "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  return proto === "https";
}

export function sessionCookie(token, { secure }) {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${SESSION_HOURS * 3600}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearedSessionCookie({ secure }) {
  const parts = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

/** Dica de navegação (sem valor sensível): apenas "1". */
export function hintCookie({ secure }) {
  const parts = [
    `${HINT_COOKIE}=1`,
    "Path=/",
    "SameSite=Strict",
    `Max-Age=${SESSION_HOURS * 3600}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearedHintCookie({ secure }) {
  const parts = [
    `${HINT_COOKIE}=`,
    "Path=/",
    "SameSite=Strict",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function readCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return "";

  for (const part of String(header).split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) {
      const value = part.slice(index + 1).trim();
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }

  return "";
}

async function createSession(env, userId, { ip, userAgent }) {
  const token = randomBytes(32).toString("base64url");

  await query(
    env,
    `INSERT INTO admin_sessions (user_id, token_hash, ip_hash, user_agent, expires_at)
     VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ${SESSION_HOURS} HOUR))`,
    [userId, sha256(token), ip ? sha256(ip) : null, String(userAgent ?? "").slice(0, 255)],
  );

  return token;
}

export async function findSession(env, token) {
  if (!token || token.length < 20) return null;

  const rows = await query(
    env,
    `SELECT s.id AS session_id, s.expires_at, u.id AS user_id, u.email
       FROM admin_sessions s
       JOIN admin_users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > NOW() AND u.is_active = 1
      LIMIT 1`,
    [sha256(token)],
  );

  const row = rows[0];
  if (!row) return null;

  return { sessionId: row.session_id, userId: row.user_id, email: row.email };
}

export async function destroySession(env, token) {
  if (!token) return;
  await query(env, "DELETE FROM admin_sessions WHERE token_hash = ?", [sha256(token)]);
}

async function countRecentFailures(env, identifierHash, ipHash) {
  const rows = await query(
    env,
    `SELECT COUNT(*) AS total
       FROM login_attempts
      WHERE succeeded = 0
        AND created_at > DATE_SUB(NOW(), INTERVAL ${FAILURE_WINDOW_MINUTES} MINUTE)
        AND (identifier_hash = ? OR ip_hash = ?)`,
    [identifierHash, ipHash],
  );

  return Number(rows[0]?.total ?? 0);
}

async function recordAttempt(env, identifierHash, ipHash, succeeded) {
  await query(
    env,
    "INSERT INTO login_attempts (identifier_hash, ip_hash, succeeded) VALUES (?, ?, ?)",
    [identifierHash, ipHash, succeeded ? 1 : 0],
  );
}

export async function login(env, { email, password, ip, userAgent }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const identifierHash = sha256(normalizedEmail);
  const ipHash = sha256(ip || "unknown");

  if ((await countRecentFailures(env, identifierHash, ipHash)) >= MAX_FAILURES) {
    return { error: "rate_limited" };
  }

  const rows = await query(
    env,
    "SELECT id, email, password_hash, is_active FROM admin_users WHERE email = ? LIMIT 1",
    [normalizedEmail],
  );

  const user = rows[0];
  let valid = false;

  if (user) {
    valid = await verifyPassword(password, user.password_hash);
  } else {
    await verifyPassword(password, await dummyHash());
  }

  if (!user || !user.is_active || !valid) {
    await recordAttempt(env, identifierHash, ipHash, false);
    return { error: "invalid_credentials" };
  }

  await recordAttempt(env, identifierHash, ipHash, true);
  await query(env, "UPDATE admin_users SET last_login_at = NOW() WHERE id = ?", [user.id]);
  await query(env, "DELETE FROM admin_sessions WHERE expires_at < NOW()");
  await query(
    env,
    "DELETE FROM login_attempts WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)",
  );

  const token = await createSession(env, user.id, { ip, userAgent });

  return { user: { id: user.id, email: user.email }, token };
}
