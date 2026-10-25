/**
 * Envio de e-mails do formulário de contato direto pelo SMTP da Hostinger.
 *
 * Roda apenas no servidor: usuário e senha da caixa postal ficam no ambiente
 * (.env em desenvolvimento ou variáveis da Hostinger em produção) e nunca
 * chegam ao navegador do visitante.
 *
 * Implementado com os módulos nativos do Node (node:net / node:tls) para não
 * precisar de dependências extras.
 */
import { once } from "node:events";
import { connect as connectPlain } from "node:net";
import { connect as connectTls } from "node:tls";
import { randomBytes } from "node:crypto";

const SMTP_TIMEOUT_MS = 20000;
const MAX_BODY_BYTES = 16 * 1024;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_REQUESTS = 4;

const hits = new Map();

function fail(code, status) {
  const error = new Error(code);
  error.code = code;
  error.status = status;
  return error;
}

export function resolveMailConfig(env = process.env) {
  const port = Number((env.SMTP_PORT ?? "465").trim()) || 465;

  return {
    host: (env.SMTP_HOST ?? "smtp.hostinger.com").trim() || "smtp.hostinger.com",
    port,
    secure: port === 465,
    user: (env.SMTP_USER ?? "contato@adrenovar.com.br").trim(),
    password: (env.SMTP_PASSWORD ?? "").trim(),
    to: (env.CONTACT_TO_EMAIL ?? "contato@adrenovar.com.br").trim(),
    fromName:
      (env.SMTP_FROM_NAME ?? "Assembleia de Deus Renovar").trim() ||
      "Assembleia de Deus Renovar",
  };
}

/* ------------------------------------------------------------------ *
 * Leitor de respostas SMTP (uma ou várias linhas, ex.: "250-..." )
 * ------------------------------------------------------------------ */
class SmtpSession {
  constructor(socket) {
    this.socket = socket;
    this.buffer = "";
    this.responses = [];
    this.pending = null;
    this.failure = null;

    this.onData = (chunk) => {
      this.buffer += chunk;
      this.drain();
    };
    this.onError = (error) => this.abort(error);
    this.onClose = () => this.abort(new Error("connection_closed"));
    this.onTimeout = () => {
      this.abort(new Error("timeout"));
      socket.destroy();
    };

    socket.setEncoding("utf8");
    socket.on("data", this.onData);
    socket.on("error", this.onError);
    socket.on("close", this.onClose);
    socket.on("timeout", this.onTimeout);
  }

  detach() {
    this.socket.off("data", this.onData);
    this.socket.off("error", this.onError);
    this.socket.off("close", this.onClose);
    this.socket.off("timeout", this.onTimeout);
    // Evita "unhandled error" enquanto o socket é encerrado ou passa por TLS.
    this.socket.on("error", () => {});
    this.onData = null;
  }

  abort(error) {
    if (this.failure) return;
    this.failure = error ?? new Error("smtp_failed");
    if (this.pending) {
      const { reject } = this.pending;
      this.pending = null;
      reject(this.failure);
    }
  }

  drain() {
    for (;;) {
      const lines = this.buffer.split("\r\n");
      let last = -1;
      for (let index = 0; index < lines.length - 1; index += 1) {
        if (/^\d{3} /.test(lines[index])) {
          last = index;
          break;
        }
      }
      if (last === -1) return;

      const responseLines = lines.slice(0, last + 1);
      this.buffer = lines.slice(last + 1).join("\r\n");
      this.responses.push({
        code: Number(responseLines[last].slice(0, 3)),
        lines: responseLines,
      });

      if (this.pending && this.responses.length > 0) {
        const { resolve } = this.pending;
        this.pending = null;
        resolve(this.responses.shift());
      }
    }
  }

  read() {
    if (this.failure) return Promise.reject(this.failure);
    if (this.responses.length > 0) return Promise.resolve(this.responses.shift());

    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject };
    });
  }

  command(line) {
    if (this.failure) return Promise.reject(this.failure);
    this.socket.write(`${line}\r\n`);
    return this.read();
  }
}

async function step(session, line, expected, context) {
  const response = line === null ? await session.read() : await session.command(line);

  if (!expected.includes(response.code)) {
    const error = fail("smtp_rejected", 502);
    error.detail = `${context}: ${response.lines.join(" | ")}`;
    throw error;
  }

  return response;
}

/* ------------------------------------------------------------------ *
 * Montagem da mensagem
 * ------------------------------------------------------------------ */
function sanitizeHeader(value) {
  return value.replace(/[\r\n]+/g, " ").replace(/"/g, "").trim();
}

function encodeHeader(value) {
  const clean = sanitizeHeader(value);
  return /^[\x20-\x7E]*$/.test(clean)
    ? clean
    : `=?UTF-8?B?${Buffer.from(clean, "utf8").toString("base64")}?=`;
}

function buildMessage(config, mail) {
  const domain = config.user.split("@")[1] || "localhost";
  const body = Buffer.from(mail.body, "utf8")
    .toString("base64")
    .replace(/(.{76})/g, "$1\r\n");

  const headers = [
    `From: "${sanitizeHeader(config.fromName)}" <${config.user}>`,
    `To: <${config.to}>`,
    `Reply-To: <${mail.replyTo}>`,
    `Subject: ${encodeHeader(mail.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="utf-8"',
    "Content-Transfer-Encoding: base64",
    `Message-ID: <${Date.now()}.${randomBytes(6).toString("hex")}@${domain}>`,
  ];

  return `${headers.join("\r\n")}\r\n\r\n${body}`;
}

function dotStuff(text) {
  return text
    .split("\r\n")
    .map((line) => (line.startsWith(".") ? `.${line}` : line))
    .join("\r\n");
}

async function deliver(config, mail) {
  const plain = config.secure
    ? connectTls({ host: config.host, port: config.port, servername: config.host })
    : connectPlain({ host: config.host, port: config.port });

  plain.setTimeout(SMTP_TIMEOUT_MS);

  const secureReady = config.secure
    ? once(plain, "secureConnect")
    : once(plain, "connect");

  let session = new SmtpSession(plain);

  try {
    await secureReady;
  } catch {
    plain.destroy();
    throw fail("smtp_unreachable", 502);
  }

  const clientName = config.user.split("@")[1] || "adrenovar.com.br";

  try {
    await step(session, null, [220], "saudação");

    let ehlo = await session.command(`EHLO ${clientName}`);
    if (ehlo.code !== 250) {
      await step(session, `HELO ${clientName}`, [250], "helo");
    }

    if (!config.secure) {
      await step(session, "STARTTLS", [220], "starttls");
      session.detach();

      const secure = connectTls({ socket: plain, servername: config.host });
      secure.setTimeout(SMTP_TIMEOUT_MS);
      const tlsReady = once(secure, "secureConnect");
      session = new SmtpSession(secure);
      await tlsReady;
      await step(session, `EHLO ${clientName}`, [250], "ehlo tls");
    }

    await step(session, "AUTH LOGIN", [334], "auth");
    await step(
      session,
      Buffer.from(config.user, "utf8").toString("base64"),
      [334],
      "auth user",
    );
    await step(
      session,
      Buffer.from(config.password, "utf8").toString("base64"),
      [235],
      "auth password",
    );

    await step(session, `MAIL FROM:<${config.user}>`, [250], "mail from");
    await step(session, `RCPT TO:<${config.to}>`, [250, 251], "rcpt to");
    await step(session, "DATA", [354], "data");

    const payload = `${dotStuff(buildMessage(config, mail))}\r\n.`;
    await step(session, payload, [250], "corpo da mensagem");

    await session.command("QUIT").catch(() => undefined);
    session.detach();
    session.socket.end();
  } catch (error) {
    session.detach();
    session.socket.destroy();
    throw error;
  }
}

/* ------------------------------------------------------------------ *
 * Validação e limite de envios
 * ------------------------------------------------------------------ */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function text(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function validateMessage(raw) {
  const name = text(raw?.name, 120);
  const email = text(raw?.email, 254);
  const phone = text(raw?.phone, 40);
  const subject = text(raw?.subject, 140);
  const message = text(raw?.message, 4000);
  const trap = text(raw?.website, 200);

  if (trap) return { error: "invalid_payload" };
  if (name.length < 2) return { error: "invalid_payload" };
  if (!EMAIL_PATTERN.test(email)) return { error: "invalid_payload" };
  if (message.length < 10) return { error: "invalid_payload" };

  return {
    value: {
      name,
      email,
      phone,
      subject: subject || "Contato pelo site",
      message,
    },
  };
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const candidate = (first ?? "").split(",")[0].trim();
  return candidate || req.socket?.remoteAddress || "unknown";
}

function takeRateSlot(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < RATE_WINDOW_MS);

  if (recent.length >= RATE_MAX_REQUESTS) {
    hits.set(ip, recent);
    return false;
  }

  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((at) => now - at >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }

  return true;
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function readJsonBody(req) {
  let size = 0;
  const chunks = [];

  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw fail("payload_too_large", 413);
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    throw fail("invalid_payload", 400);
  }
}

export async function handleContactRequest(req, res, env = process.env) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  const contentType = String(req.headers["content-type"] ?? "");
  if (!contentType.includes("application/json")) {
    sendJson(res, 415, { error: "unsupported_media_type" });
    return;
  }

  const ip = clientIp(req);
  if (!takeRateSlot(ip)) {
    sendJson(res, 429, { error: "rate_limited" });
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    sendJson(res, error?.status ?? 400, { error: error?.code ?? "invalid_payload" });
    return;
  }

  const parsed = validateMessage(payload);
  if (parsed.error) {
    sendJson(res, 400, { error: parsed.error });
    return;
  }

  const config = resolveMailConfig(env);
  if (!config.password) {
    console.error("[contato] SMTP_PASSWORD não configurada: e-mail não enviado.");
    sendJson(res, 503, { error: "mail_not_configured" });
    return;
  }

  const { name, email, phone, subject, message } = parsed.value;

  const body = [
    "Nova mensagem enviada pelo site da Assembleia de Deus Renovar.",
    "",
    `Nome: ${name}`,
    `E-mail: ${email}`,
    phone ? `Telefone: ${phone}` : "Telefone: não informado",
    `Assunto: ${subject}`,
    `Recebida em: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
    "",
    "Mensagem:",
    message,
    "",
    "— Enviado automaticamente pelo formulário de contato (adrenovar.com.br).",
  ].join("\n");

  try {
    await deliver(config, {
      replyTo: email,
      subject: `[Site] ${subject} — ${name}`,
      body,
    });
    sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error(
      "[contato] falha ao enviar e-mail:",
      error?.code ?? error?.message ?? error,
      error?.detail ?? "",
    );
    sendJson(res, 502, { error: "send_failed" });
  }
}
