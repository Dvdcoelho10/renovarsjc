/**
 * Sessão do painel administrativo.
 *
 * A autenticação de verdade acontece no servidor (`/api/admin/*`): a senha
 * nunca existe no bundle e o cookie de sessão é HttpOnly, portanto não pode
 * ser forjado pelo navegador. Aqui só conversamos com essas rotas e lemos o
 * cookie de "dica" (sem valor sensível), que apenas decide se mostramos os
 * atalhos de edição na própria página.
 */
export type AdminSessionState = {
  status: "checking" | "anonymous" | "authenticated";
  email: string;
  /** false quando o servidor respondeu que o banco ainda não está configurado. */
  dbConfigured: boolean;
};

const SESSION_ENDPOINT = "/api/admin/session";
const LOGIN_ENDPOINT = "/api/admin/login";
const LOGOUT_ENDPOINT = "/api/admin/logout";
const HINT_COOKIE = "adr_admin_hint";
const CACHE_TTL_MS = 20 * 1000;

export type LoginResult = { ok: true } | { ok: false; error: string };

let cache: { at: number; state: AdminSessionState } | null = null;

export const anonymousSession: AdminSessionState = {
  status: "anonymous",
  email: "",
  dbConfigured: true,
};

/** Lê a dica de navegação (cookie não-HttpOnly). Não autoriza nada. */
export function hasAdminHint() {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((part) => part.trim().startsWith(`${HINT_COOKIE}=`));
}

export function clearAdminSessionCache() {
  cache = null;
}

export async function fetchAdminSession(
  options: { force?: boolean } = {},
): Promise<AdminSessionState> {
  if (!options.force && cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.state;
  }

  try {
    const response = await fetch(SESSION_ENDPOINT, {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });
    const data = (await response.json().catch(() => ({}))) as {
      authenticated?: boolean;
      user?: { email?: string };
      error?: string;
    };

    const state: AdminSessionState = {
      status: data?.authenticated ? "authenticated" : "anonymous",
      email: typeof data?.user?.email === "string" ? data.user.email : "",
      dbConfigured: data?.error !== "db_not_configured",
    };

    cache = { at: Date.now(), state };
    return state;
  } catch {
    cache = { at: Date.now(), state: anonymousSession };
    return anonymousSession;
  }
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<LoginResult> {
  try {
    const response = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      user?: { email?: string };
    };

    if (response.ok && data?.ok) {
      cache = {
        at: Date.now(),
        state: {
          status: "authenticated",
          email: data?.user?.email ?? email,
          dbConfigured: true,
        },
      };
      return { ok: true };
    }

    return {
      ok: false,
      error: typeof data?.error === "string" ? data.error : "login_failed",
    };
  } catch {
    return { ok: false, error: "network_error" };
  }
}

export async function logoutAdmin() {
  try {
    await fetch(LOGOUT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: "{}",
    });
  } catch {
    // Sem rede: o cookie expira sozinho; a sessão do banco segue válida até expirar.
  }
  cache = { at: Date.now(), state: anonymousSession };
}
