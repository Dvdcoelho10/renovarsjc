import { useEffect, useState } from "react";
import { RefreshCw, Youtube } from "lucide-react";

import { AdminSection, TextAreaField, TextField } from "@/components/admin/fields";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  getYoutubeChannelId,
  getYoutubeVideoId,
  type SiteContent,
  type YoutubeCopy,
} from "@/content/site";
import { fetchYoutubeLiveState, type YoutubeLiveState } from "@/lib/youtube";

type Props = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
};

const statusText = {
  loading: "Verificando o canal...",
  live: "Transmissão ao vivo encontrada",
  offline: "Nenhuma transmissão ao vivo neste momento",
  error: "Não foi possível consultar a API do YouTube",
} as const;

export function YoutubeForm({ content, onChange }: Props) {
  const youtube = content.youtube;
  const [state, setState] = useState<YoutubeLiveState | null>(null);
  const [checking, setChecking] = useState(false);

  const patch = <K extends keyof YoutubeCopy>(key: K, value: YoutubeCopy[K]) =>
    onChange({ ...content, youtube: { ...youtube, [key]: value } });

  const check = async () => {
    setChecking(true);
    const next = await fetchYoutubeLiveState(youtube, { force: true });
    setState(next);
    setChecking(false);
  };

  useEffect(() => {
    let cancelled = false;
    void fetchYoutubeLiveState(youtube, { force: true }).then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
    // Consulta apenas ao abrir a aba.
  }, []);

  const channelId = getYoutubeChannelId(youtube.channel);
  const videoId = getYoutubeVideoId(youtube.videoUrl);
  const liveId = state?.status === "live" ? state.videoId : undefined;

  return (
    <div className="grid gap-5">
      <AdminSection
        title="Transmissão do canal"
        description="A seção fica na página inicial e verifica automaticamente se o canal está ao vivo."
      >
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/40 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Exibir transmissão no site
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Desligue para ocultar a seção sem apagar a configuração.
            </p>
          </div>
          <Switch
            checked={youtube.enabled}
            onCheckedChange={(checked) => patch("enabled", checked)}
            aria-label="Exibir transmissão no site"
          />
        </div>

        <TextField
          id="youtube-channel"
          label="Canal do YouTube (ID ou link)"
          value={youtube.channel}
          onChange={(value) => patch("channel", value)}
          placeholder="UCpnq0C4PXHGSIV2mjNAVrBw"
          hint="Canal oficial configurado: TV Renovar — UCpnq0C4PXHGSIV2mjNAVrBw. O ID começa com “UC” e tem 24 caracteres."
        />
        <TextField
          id="youtube-api-key"
          label="Chave da API do YouTube"
          value={youtube.apiKey}
          onChange={(value) => patch("apiKey", value)}
          placeholder="AIza..."
          hint="Usada só no navegador para consultar o canal. Restrinja a chave por HTTP referrer no Google Cloud para evitar uso indevido."
        />
        <TextField
          id="youtube-video"
          label="Link de uma transmissão específica (opcional)"
          type="url"
          value={youtube.videoUrl}
          onChange={(value) => patch("videoUrl", value)}
          placeholder="https://www.youtube.com/watch?v=..."
          hint="Tem prioridade sobre a detecção automática. Aceita watch?v=, youtu.be, /live/ e /embed/."
        />
        <TextField
          id="youtube-channel-url"
          label="Link público do canal"
          type="url"
          value={youtube.channelUrl}
          onChange={(value) => patch("channelUrl", value)}
          placeholder="https://www.youtube.com/channel/UC..."
          hint="Usado nos botões “Abrir no YouTube”."
        />
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
        title="Status da transmissão"
        description="Consulta a API do YouTube com os dados acima. Atualiza sozinha a cada 5 minutos no site."
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

        {liveId ? (
          <iframe
            title="Pré-visualização da transmissão"
            src={`https://www.youtube.com/embed/${liveId}?rel=0`}
            className="aspect-video w-full rounded-2xl border border-border"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-background/60 p-5 text-sm leading-relaxed text-muted-foreground">
            {channelId || videoId
              ? "O player aparece aqui quando o canal estiver ao vivo (ou quando um link de transmissão for salvo)."
              : "Informe o ID do canal (UC...) ou o link de uma transmissão para ativar o player."}
          </p>
        )}
      </AdminSection>
    </div>
  );
}
