import { useEffect, useState } from "react";
import { RefreshCw, Server, Youtube } from "lucide-react";

import { AdminSection, TextAreaField, TextField } from "@/components/admin/fields";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { SiteContent, YoutubeCopy } from "@/content/site";
import { formatLongDate } from "@/lib/format";
import { fetchLatestVideo, type YoutubeLatestState } from "@/lib/youtube";

type Props = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
};

const statusText = {
  loading: "Consultando o canal...",
  ready: "Último vídeo encontrado",
  empty: "Nenhum vídeo publicado no canal",
  error: "Não foi possível consultar a API do YouTube",
} as const;

type ServerCheck = {
  ok: boolean;
  config?: { channelId: string; playlistId: string; keyConfigured: boolean };
  video?: { videoId: string | null; title: string; publishedAt: string | null };
  error?: string;
  reason?: string;
  httpStatus?: number | null;
  detail?: string;
  lastAttempt?: { at: string; ok: boolean; error?: string; reason?: string } | null;
};

/** Traduz o retorno da API para o que precisa ser ajustado no servidor. */
const serverHints: Record<string, string> = {
  missing_api_key:
    "O servidor não recebeu YOUTUBE_API_KEY. Na Hostinger, cadastre nas variáveis do app (hPanel) e reinicie o processo Node.",
  youtube_error:
    "O Google recusou a consulta. Veja o motivo abaixo: chave inválida/revogada, cota esgotada ou canal/playlist incorretos.",
  youtube_unreachable:
    "O servidor não conseguiu falar com googleapis.com (saída de rede bloqueada ou DNS). Fale com a hospedagem.",
  youtube_invalid_response:
    "A resposta do Google veio em formato inesperado. Tente novamente em instantes.",
  keyInvalid: "A chave da API é inválida — gere outra no Google Cloud e atualize o servidor.",
  keyExpired: "A chave expirou — gere outra no Google Cloud.",
  API_KEY_SERVICE_BLOCKED:
    "A chave existe, mas a YouTube Data API v3 não está liberada para ela no Google Cloud.",
  quotaExceeded:
    "Cota diária da YouTube Data API esgotada. Aguarde a renovação (meia-noite no horário do Pacífico) ou aumente a cota.",
  playlistNotFound:
    "Playlist de uploads não encontrada — YOUTUBE_CHANNEL_ID provavelmente está errado.",
  ipRefererBlocked:
    "A chave tem restrição de IP/referrer que não inclui o servidor da hospedagem.",
};

export function YoutubeForm({ content, onChange }: Props) {
  const youtube = content.youtube;
  const [state, setState] = useState<YoutubeLatestState | null>(null);
  const [checking, setChecking] = useState(false);
  const [serverCheck, setServerCheck] = useState<ServerCheck | null>(null);
  const [serverChecking, setServerChecking] = useState(false);

  const patch = <K extends keyof YoutubeCopy>(key: K, value: YoutubeCopy[K]) =>
    onChange({ ...content, youtube: { ...youtube, [key]: value } });

  const check = async () => {
    setChecking(true);
    const next = await fetchLatestVideo({ force: true });
    setState(next);
    setChecking(false);
  };

  const runServerCheck = async () => {
    setServerChecking(true);
    setServerCheck(null);

    try {
      const response = await fetch("/api/admin/youtube/check", {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      });
      const data = (await response.json()) as ServerCheck;
      setServerCheck(data);
    } catch {
      setServerCheck({
        ok: false,
        error: "network_error",
        detail: "Não foi possível falar com o servidor do site.",
      });
    } finally {
      setServerChecking(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    void fetchLatestVideo({ force: true }).then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
    // Consulta apenas ao abrir a aba.
  }, []);

  return (
    <div className="grid gap-5">
      <AdminSection
        title="Último vídeo do canal"
        description="A seção da página inicial mostra sempre o vídeo mais recente publicado no canal. Quando sai um vídeo novo, ele substitui o anterior automaticamente."
      >
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/40 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Exibir o último vídeo no site
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Desligue para ocultar a seção sem apagar a configuração.
            </p>
          </div>
          <Switch
            checked={youtube.enabled}
            onCheckedChange={(checked) => patch("enabled", checked)}
            aria-label="Exibir o último vídeo no site"
          />
        </div>

        <TextField
          id="youtube-title"
          label="Título do bloco"
          value={youtube.title}
          onChange={(value) => patch("title", value)}
        />
        <TextAreaField
          id="youtube-description"
          label="Descrição do bloco"
          value={youtube.description}
          onChange={(value) => patch("description", value)}
        />
      </AdminSection>

      <AdminSection
        title="Conexão com o YouTube"
        description="Canal e chave da API ficam no servidor, fora do navegador."
      >
        <div className="flex gap-3 rounded-2xl border border-border/70 bg-background/40 p-4">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <Server className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="text-sm leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">Variáveis do servidor</p>
            <p className="mt-1">
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs text-primary">
                YOUTUBE_CHANNEL_ID
              </code>{" "}
              e{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs text-primary">
                YOUTUBE_API_KEY
              </code>
              . Em desenvolvimento, defina no arquivo <code>.env</code>; na
              Hostinger, nas variáveis de ambiente do aplicativo.
            </p>
            <p className="mt-2 text-xs">
              Para trocar o canal ou a chave, ajuste no servidor e reinicie o
              app. Nada disso é enviado ao navegador do visitante.
            </p>
          </div>
        </div>
      </AdminSection>

      <AdminSection
        title="Status do canal"
        description="A consulta é feita pelo servidor. No site, a verificação se repete a cada 2 minutos."
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-primary">
            <Youtube className="h-3.5 w-3.5" aria-hidden="true" />
            {state ? statusText[state.status] : "Ainda não verificado"}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={check}
            disabled={checking}
            className="rounded-full border-border hover:bg-secondary"
          >
            <RefreshCw
              className={`mr-1.5 h-4 w-4 ${checking ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Verificar agora
          </Button>
        </div>

        {state?.status === "ready" ? (
          <>
            <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="text-sm font-medium text-foreground">{state.title}</p>
              {state.publishedAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Publicado em {formatLongDate(state.publishedAt)}
                </p>
              )}
            </div>
            <iframe
              title="Pré-visualização do último vídeo"
              src={`https://www.youtube.com/embed/${state.videoId}?rel=0`}
              className="aspect-video w-full rounded-2xl border border-border"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </>
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-background/60 p-5 text-sm leading-relaxed text-muted-foreground">
            {state?.status === "error"
              ? "A consulta falhou. Use o diagnóstico abaixo para ver o motivo exato informado pelo servidor."
              : "O player aparece aqui quando houver um vídeo publicado no canal."}
          </p>
        )}
      </AdminSection>

      <AdminSection
        title="Diagnóstico da API no servidor"
        description="O teste roda no servidor onde o site está publicado — na Hostinger, na versão online — e mostra a configuração e o motivo exato de qualquer falha."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={runServerCheck}
            disabled={serverChecking}
            className="rounded-full border-border hover:bg-secondary"
          >
            <Server className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {serverChecking ? "Testando no servidor..." : "Testar no servidor"}
          </Button>

          {serverCheck && (
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                serverCheck.ok
                  ? "bg-secondary text-primary"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {serverCheck.ok ? "API respondendo" : "Falhou"}
            </span>
          )}
        </div>

        {serverCheck?.config && (
          <ul className="grid gap-2 rounded-2xl border border-border/70 bg-background/60 p-4 text-sm">
            <li className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">Chave da API</span>
              <span
                className={
                  serverCheck.config.keyConfigured
                    ? "text-right font-medium text-foreground"
                    : "text-right font-medium text-destructive"
                }
              >
                {serverCheck.config.keyConfigured
                  ? "definida no servidor"
                  : "ausente no servidor"}
              </span>
            </li>
            <li className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">Canal</span>
              <span className="text-right font-medium text-foreground">
                {serverCheck.config.channelId}
              </span>
            </li>
            <li className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">Playlist de uploads</span>
              <span className="break-all text-right font-medium text-foreground">
                {serverCheck.config.playlistId}
              </span>
            </li>
          </ul>
        )}

        {serverCheck?.ok && serverCheck.video && (
          <p className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm leading-relaxed text-muted-foreground">
            O servidor encontrou o vídeo:{" "}
            <strong className="font-medium text-foreground">
              {serverCheck.video.title || serverCheck.video.videoId}
            </strong>
          </p>
        )}

        {serverCheck && !serverCheck.ok && (
          <div className="grid gap-2 rounded-2xl border border-destructive/30 bg-destructive/[0.06] p-4">
            <p className="text-sm font-medium text-destructive">
              {serverCheck.error}
              {serverCheck.httpStatus ? ` · HTTP ${serverCheck.httpStatus}` : ""}
              {serverCheck.reason ? ` · ${serverCheck.reason}` : ""}
            </p>

            {serverCheck.detail && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {serverCheck.detail}
              </p>
            )}

            {serverCheck.error === "network_error" ? (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Sem resposta de <code>/api/admin/youtube/check</code>: o processo
                Node pode não estar atendendo o domínio.
              </p>
            ) : (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {[serverHints[serverCheck.error ?? ""], serverHints[serverCheck.reason ?? ""]]
                  .filter(Boolean)
                  .join(" ")}
              </p>
            )}
          </div>
        )}

        <p className="text-xs leading-relaxed text-muted-foreground">
          Se funciona no seu computador e não aqui, a diferença está no servidor:
          variáveis não cadastradas no hPanel, processo não reiniciado depois de
          alterá-las, chave revogada (por exemplo, após vazar em um chat) ou cota
          diária esgotada.
        </p>
      </AdminSection>
    </div>
  );
}
