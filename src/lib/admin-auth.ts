/**
 * Controle de acesso do painel /admins.
 *
 * IMPORTANTE: este site ainda não possui servidor nem banco de dados conectado,
 * portanto a verificação acontece no navegador. Isso serve como porteiro de
 * navegação (o painel não aparece no menu e exige login), mas não é uma
 * autenticação segura contra alguém com acesso técnico ao código.
 * Quando o banco de dados for conectado, estas credenciais devem migrar para
 * o servidor e este arquivo deve ser removido.
 */

const ADMIN_EMAIL = "admin@adrenovar.com.br";
const ADMIN_PASSWORD = "Adrenovar@2026#";

const SESSION_KEY = "adr-admin-session-v1";
const HINT_KEY = "adr-admin-hint-v1";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

function localExpiry() {
  try {
    const value = Number(window.localStorage.getItem(SESSION_KEY));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function sessionExpiry() {
  try {
    const value = Number(window.sessionStorage.getItem(SESSION_KEY));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function authenticateAdmin(email: string, password: string) {
  const matches =
    email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;

  if (matches) {
    const expiresAt = String(Date.now() + SESSION_DURATION_MS);
    try {
      // A sessão fica no localStorage para valer em todas as abas do site.
      window.localStorage.setItem(SESSION_KEY, expiresAt);
      window.localStorage.setItem(HINT_KEY, expiresAt);
    } catch {
      // Sem localStorage, tenta a sessão da aba.
    }
    try {
      window.sessionStorage.setItem(SESSION_KEY, expiresAt);
    } catch {
      // Sem sessionStorage, a sessão vale apenas nesta página.
    }
  }

  return matches;
}

export function hasAdminSession() {
  if (localExpiry() > Date.now()) return true;

  const fromSession = sessionExpiry();
  if (fromSession > Date.now()) {
    // Sessões antigas (só da aba) passam a valer para o navegador inteiro.
    try {
      const expiresAt = String(fromSession);
      window.localStorage.setItem(SESSION_KEY, expiresAt);
      window.localStorage.setItem(HINT_KEY, expiresAt);
    } catch {
      // Sem localStorage, a sessão continua valendo nesta aba.
    }
    return true;
  }

  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(HINT_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignora falhas de armazenamento.
  }

  return false;
}

export function endAdminSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(HINT_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignora falhas de armazenamento.
  }
}

/**
 * Indica se o navegador já autenticou o painel recentemente — usado apenas para
 * exibir os atalhos de edição na própria página. Não libera dados por si só.
 */
export function hasEditorHint() {
  if (hasAdminSession()) return true;

  try {
    const expiresAt = Number(window.localStorage.getItem(HINT_KEY));
    if (!expiresAt || Number.isNaN(expiresAt) || expiresAt < Date.now()) {
      window.localStorage.removeItem(HINT_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export const adminEmail = ADMIN_EMAIL;
