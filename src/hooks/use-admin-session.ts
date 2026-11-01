import { useCallback, useEffect, useState } from "react";

import {
  anonymousSession,
  fetchAdminSession,
  hasAdminHint,
  type AdminSessionState,
} from "@/lib/admin-session";

const initial: AdminSessionState = {
  status: "checking",
  email: "",
  dbConfigured: true,
  dbMissing: [],
};

/**
 * Consulta a sessão administrativa no servidor e permite revalidar (após
 * login/logout ou ao voltar para a aba).
 *
 * Visitantes sem o cookie de dica `adr_admin_hint` não fazem nenhuma
 * requisição: já começam como anônimos.
 */
export function useAdminSession() {
  const [session, setSession] = useState<AdminSessionState>(() =>
    hasAdminHint() ? initial : anonymousSession,
  );

  const refresh = useCallback(async (force = true) => {
    const next = await fetchAdminSession({ force });
    setSession(next);
    return next;
  }, []);

  useEffect(() => {
    if (!hasAdminHint()) {
      setSession(anonymousSession);
      return;
    }

    let cancelled = false;

    void fetchAdminSession().then((next) => {
      if (!cancelled) setSession(next);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { session, refresh };
}
