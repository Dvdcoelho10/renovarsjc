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

export function authenticateAdmin(email: string, password: string) {
  const matches =
    email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;

  if (matches) {
    const expiresAt = String(Date.now() + SESSION_DURATION_MS);
    try {
      window.sessionStorage.setItem(SESSION_KEY, expiresAt);
      // Aviso visual entre abas: mostra o atalho de edição no site.
      window.localStorage.setItem(HINT_KEY, expiresAt);
    } catch {
      // Sem armazenamento, a sessão vale apenas enquanto a página estiver aberta.
    }
  }

  return matches;
}

export function hasAdminSession() {
  try {
    const expiresAt = Number(window.sessionStorage.getItem(SESSION_KEY));
    if (!expiresAt || Number.isNaN(expiresAt)) return false;
    if (expiresAt < Date.now()) {
      window.sessionStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function endAdminSession() {
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(HINT_KEY);
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
