import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAdmin } from "@/lib/admin-session";

const loginErrorMessages: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  rate_limited:
    "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
  db_not_configured:
    "O banco de dados ainda não foi configurado no servidor. Fale com quem cuida da hospedagem.",
  db_unavailable:
    "O banco está configurado, mas a conexão falhou. Confira se o MySQL está rodando, se o banco/tabelas existem (pnpm db:setup) e a senha do .env.",
  invalid_origin:
    "Não foi possível validar o pedido. Recarregue a página e tente novamente.",
  invalid_payload: "Informe um e-mail e uma senha válidos.",
  network_error:
    "Não foi possível falar com o servidor. Verifique sua conexão e tente novamente.",
};

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Informe o e-mail e a senha.");
      return;
    }

    setPending(true);
    const result = await loginAdmin(email, password);
    setPending(false);

    if (result.ok) {
      onSuccess();
      return;
    }

    if (result.error === "db_not_configured" || result.error === "db_unavailable") {
      setError(
        result.error === "db_unavailable"
          ? loginErrorMessages.db_unavailable
          : result.missing && result.missing.length > 0
            ? `O servidor não encontrou o banco de dados: faltam ${result.missing.join(
                ", ",
              )}. Preencha no .env (computador) ou nas variáveis da Hostinger e reinicie.`
            : "O banco de dados ainda não foi configurado no servidor. Fale com quem cuida da hospedagem.",
      );
      setShowDiagnostics(true);
      return;
    }

    setError(
      loginErrorMessages[result.error] ??
        "Não foi possível entrar agora. Tente novamente.",
    );
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full border border-primary-foreground/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full border border-primary-foreground/10"
      />

      <div className="relative w-full max-w-md">
        <div className="rounded-[2rem] bg-card p-6 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.55)] sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
              <LockKeyhole className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent-deep">
                Área restrita
              </p>
              <h1 className="font-serif text-xl leading-tight">
                Painel administrativo
              </h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Acesso exclusivo da liderança para publicar textos, imagens, links,
            agenda e mensagens da igreja.
          </p>

          <form className="mt-7 grid gap-4" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-2">
              <Label
                htmlFor="admin-email"
                className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                E-mail
              </Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@adrenovar.com.br"
                className="h-11 rounded-xl border-border bg-background"
              />
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="admin-password"
                className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-border bg-background pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={pending}
              className="mt-1 h-11 rounded-full"
            >
              {pending ? "Entrando..." : "Entrar no painel"}
            </Button>
          </form>

          {showDiagnostics ? (
            <ServerDiagnostics />
          ) : (
            <button
              type="button"
              onClick={() => setShowDiagnostics(true)}
              className="mt-4 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Ver diagnóstico do servidor
            </button>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Logo variant="dark" size="sm" showWordmark={false} />
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-primary-foreground/80 underline-offset-4 hover:text-primary-foreground hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}

type HealthResponse = {
  node?: string;
  db?: {
    configured?: boolean;
    connected?: boolean;
    tables?: string;
    missingTables?: string[];
    error?: string;
    /** Só aparece rodando em desenvolvimento (host:porta/banco). */
    target?: string;
    user?: string;
    passwordSet?: boolean;
    /** Só em desenvolvimento: quantos administradores existem no banco. */
    adminCount?: number;
  };
  smtpConfigured?: boolean;
  youtubeConfigured?: boolean;
};

/**
 * Explica o erro de conexão já com o que sabemos do `.env` (destino, usuário e
 * se há senha). Isso evita a dica genérica quando o caso é específico.
 */
function dbHintFor(db: NonNullable<HealthResponse["db"]>) {
  const base = dbErrorHints[db.error ?? ""] ?? "";

  if (db.error !== "ER_ACCESS_DENIED_ERROR") return base;

  const extras: string[] = [];

  if (!db.passwordSet) {
    extras.push(
      "A senha do banco está vazia no .env: se o seu MySQL pede senha para o root, preencha DB_PASSWORD (ou crie um usuário só do site no phpMyAdmin).",
    );
  }

  if ((db.target ?? "").startsWith("localhost")) {
    extras.push(
      "Troque DB_HOST para 127.0.0.1: com “localhost” o Node pode conectar por IPv6 (::1) e o MySQL recusar a conta.",
    );
  }

  return [base, ...extras].join(" ");
}

/** Traduz o código do MySQL para o que precisa ser corrigido. */
const dbErrorHints: Record<string, string> = {
  ER_ACCESS_DENIED_ERROR:
    "O MySQL respondeu, mas recusou o usuário/senha. Confira DB_USER e DB_PASSWORD no .env (ou se DB_HOST está apontando para o servidor da Hostinger, que não aceita login de fora).",
  ER_DBACCESS_DENIED_ERROR:
    "O usuário existe, mas não tem permissão neste banco. Libere o acesso no phpMyAdmin ou use outro DB_USER.",
  ER_BAD_DB_ERROR:
    "O banco informado em DB_NAME não existe nesse servidor. Rode: pnpm db:setup",
  ER_NO_SUCH_TABLE:
    "O banco existe, mas faltam tabelas. Rode: pnpm db:setup",
  ECONNREFUSED:
    "Nada escutando nesse host/porta. O serviço do MySQL/MariaDB está iniciado?",
  ETIMEDOUT:
    "Tempo esgotado ao conectar. Porta errada, firewall ou host remoto bloqueado.",
  ENOTFOUND:
    "DB_HOST não foi encontrado na rede. Confira o endereço no .env.",
  EHOSTUNREACH:
    "O host do banco não está acessível a partir desta máquina.",
};

/**
 * Mostra o resultado de GET /api/health na própria tela de login: é o caminho
 * mais rápido para saber se falta banco, tabela ou se o Node não está rodando.
 */
function ServerDiagnostics() {
  const [state, setState] = useState<"loading" | "ready" | "unreachable">(
    "loading",
  );
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/health", {
          headers: { Accept: "application/json" },
        });
        const data = (await response.json()) as HealthResponse;
        if (cancelled) return;
        setHealth(data);
        setState("ready");
      } catch {
        if (!cancelled) setState("unreachable");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const db = health?.db;
  const rows: { label: string; value: string; ok: boolean }[] = [];

  if (health) {
    rows.push({
      label: "Servidor Node",
      value: health.node ? `respondendo (${health.node})` : "respondendo",
      ok: true,
    });
    rows.push({
      label: "Banco configurado",
      value: db?.configured ? "sim" : "não (faltam variáveis DB_*)",
      ok: Boolean(db?.configured),
    });
    if (db?.target) {
      rows.push({
        label: "Destino (dev)",
        value: `${db.target} · ${db.user || "?"} · senha ${
          db.passwordSet ? "definida" : "vazia"
        }`,
        ok: true,
      });
    }
    rows.push({
      label: "Conexão com o banco",
      value: db?.connected
        ? "conectada"
        : db?.error
          ? `falhou (${db.error})`
          : "não testada",
      ok: Boolean(db?.connected),
    });
    rows.push({
      label: "Tabelas da migração",
      value:
        db?.tables === "ready"
          ? "prontas"
          : db?.missingTables && db.missingTables.length > 0
            ? `faltam: ${db.missingTables.join(", ")}`
            : db?.tables === "not_configured"
              ? "sem banco configurado"
              : "não verificadas",
      ok: db?.tables === "ready",
    });
    if (typeof db?.adminCount === "number") {
      rows.push({
        label: "Administrador cadastrado",
        value:
          db.adminCount > 0
            ? `${db.adminCount} (o login confere e-mail e senha aqui)`
            : "nenhum ainda — rode: pnpm admin:create",
        ok: db.adminCount > 0,
      });
    }
    rows.push({
      label: "Envio de e-mail",
      value: health.smtpConfigured ? "configurado" : "sem senha SMTP",
      ok: Boolean(health.smtpConfigured),
    });
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-background/70 p-4">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Diagnóstico do servidor
      </p>

      {state === "loading" && (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Consultando /api/health…
        </p>
      )}

      {state === "unreachable" && (
        <p className="mt-3 text-sm leading-relaxed text-destructive">
          Não foi possível consultar <code>/api/health</code>. Isso indica que o
          servidor Node não está atendendo este endereço — hospedagem estática
          não executa o painel.
        </p>
      )}

      {state === "ready" && (
        <>
          <ul className="mt-3 grid gap-2">
            {rows.map((row) => (
              <li
                key={row.label}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span
                  className={
                    row.ok
                      ? "text-right font-medium text-foreground"
                      : "text-right font-medium text-destructive"
                  }
                >
                  {row.value}
                </span>
              </li>
            ))}
          </ul>

          {db?.error && dbHintFor(db) && (
            <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-xs leading-relaxed text-destructive">
              {dbHintFor(db)}
            </p>
          )}

          <ol className="mt-3 grid gap-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>
              1. No computador: instale MySQL/MariaDB (ou XAMPP) e deixe o
              serviço rodando.
            </li>
            <li>
              2. Preencha <code>DB_HOST</code>, <code>DB_NAME</code>,{" "}
              <code>DB_USER</code> e <code>DB_PASSWORD</code> no{" "}
              <code>.env</code>.
            </li>
            <li>
              3. Rode <code>pnpm db:setup</code> (cria o banco e as tabelas) e{" "}
              <code>pnpm admin:create</code> (cria o acesso).
            </li>
            <li>4. Reinicie o servidor e volte aqui.</li>
          </ol>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Na Hostinger: use as variáveis do app no hPanel, importe a migração
            no phpMyAdmin e reinicie.
          </p>
        </>
      )}
    </div>
  );
}
