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

export function YoutubeForm({ content, onChange }: Props) {
  const youtube = content.youtube;
  const [state, setState] = useState<YoutubeLatestState | null>(null);
  const [checking, setChecking] = useState(false);

  const patch = <K extends keyof YoutubeCopy>(key: K, value: YoutubeCopy[K]) =>
    onChange({ ...content, youtube: { ...youtube, [key]: value } });

  const check = async () => {
    setChecking(true);
    const next = await fetchLatestVideo({ force: true });
    setState(next);
    setChecking(false);
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
              ? "A consulta falhou. Confirme se YOUTUBE_API_KEY e YOUTUBE_CHANNEL_ID estão definidas no servidor (arquivo .env ou variáveis da Hostinger), se a YouTube Data API v3 está ativa e se a chave permite o domínio do site."
              : "O player aparece aqui quando houver um vídeo publicado no canal."}
          </p>
        )}
      </AdminSection>
    </div>
  );
}
