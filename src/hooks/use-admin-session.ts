import { useCallback, useEffect, useState } from "react";

import {
  fetchAdminSession,
  type AdminSessionState,
} from "@/lib/admin-session";

const initial: AdminSessionState = {
  status: "checking",
  email: "",
  dbConfigured: true,
};

/**
 * Consulta a sessão administrativa no servidor uma vez e permite revalidar
 * (após login/logout ou ao voltar para a aba).
 */
export function useAdminSession() {
  const [session, setSession] = useState<AdminSessionState>(initial);

  const refresh = useCallback(async (force = true) => {
    const next = await fetchAdminSession({ force });
    setSession(next);
    return next;
  }, []);

  useEffect(() => {
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
