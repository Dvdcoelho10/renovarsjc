import { useCallback, useEffect, useState } from "react";

import type { YoutubeCopy } from "@/content/site";
import {
  fetchYoutubeLiveState,
  type YoutubeLiveState,
} from "@/lib/youtube";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function useYoutubeLive(youtube: YoutubeCopy) {
  const [state, setState] = useState<YoutubeLiveState>({ status: "loading" });
  const [refreshToken, setRefreshToken] = useState(0);
  const configKey = `${youtube.channel}|${youtube.videoUrl}|${youtube.apiKey}`;

  useEffect(() => {
    if (!youtube.enabled) return;

    let cancelled = false;
    const config = youtube;

    setState({ status: "loading" });
    void fetchYoutubeLiveState(config).then((next) => {
      if (!cancelled) setState(next);
    });

    const interval = window.setInterval(() => {
      void fetchYoutubeLiveState(config, { force: true }).then((next) => {
        if (!cancelled) setState(next);
      });
    }, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
    // configKey resume os campos que mudam a consulta.
  }, [configKey, refreshToken, youtube.enabled]);

  const refresh = useCallback(() => {
    setRefreshToken((token) => token + 1);
  }, []);

  return { state, refresh };
}
