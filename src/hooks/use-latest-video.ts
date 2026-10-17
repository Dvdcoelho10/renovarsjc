import { useCallback, useEffect, useState } from "react";

import type { YoutubeCopy } from "@/content/site";
import { fetchLatestVideo, type YoutubeLatestState } from "@/lib/youtube";

/** Reconsulta o canal com frequência para pegar vídeos recém-publicados. */
const REFRESH_INTERVAL_MS = 2 * 60 * 1000;

export function useLatestVideo(youtube: YoutubeCopy) {
  const [state, setState] = useState<YoutubeLatestState>({ status: "loading" });
  const [refreshToken, setRefreshToken] = useState(0);
  const configKey = `${youtube.channel}|${youtube.apiKey}`;

  useEffect(() => {
    if (!youtube.enabled) return;

    let cancelled = false;
    const config = youtube;

    const load = (
      options: { force?: boolean; silent?: boolean } = {},
    ) => {
      if (!options.silent) setState({ status: "loading" });
      void fetchLatestVideo(config, { force: options.force }).then((next) => {
        if (!cancelled) setState(next);
      });
    };

    load({ force: refreshToken > 0 });

    const interval = window.setInterval(() => {
      load({ force: true, silent: true });
    }, REFRESH_INTERVAL_MS);

    // Ao voltar para a aba (ou reconectar), confere de novo na hora.
    const revalidate = () => {
      if (document.visibilityState === "visible") {
        load({ force: true, silent: true });
      }
    };
    document.addEventListener("visibilitychange", revalidate);
    window.addEventListener("online", revalidate);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", revalidate);
      window.removeEventListener("online", revalidate);
    };
    // configKey resume os campos que mudam a consulta.
  }, [configKey, refreshToken, youtube.enabled]);

  const refresh = useCallback(() => {
    setRefreshToken((token) => token + 1);
  }, []);

  return { state, refresh };
}
