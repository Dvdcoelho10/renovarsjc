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
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export function authenticateAdmin(email: string, password: string) {
  const matches =
    email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;

  if (matches) {
    try {
      window.sessionStorage.setItem(
        SESSION_KEY,
        String(Date.now() + SESSION_DURATION_MS),
      );
    } catch {
      // Sem sessionStorage, a sessão vale apenas enquanto a página estiver aberta.
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
  } catch {
    // Ignora falhas de armazenamento.
  }
}

export const adminEmail = ADMIN_EMAIL;
