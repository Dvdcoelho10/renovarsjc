import { AdminSection, TextAreaField, TextField } from "@/components/admin/fields";
import {
  getYoutubeChannelId,
  getYoutubeVideoId,
  type SiteContent,
} from "@/content/site";

type Props = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
};

export function YoutubeForm({ content, onChange }: Props) {
  const youtube = content.youtube;

  const patch = (key: keyof typeof youtube, value: string) =>
    onChange({ ...content, youtube: { ...youtube, [key]: value } });

  const videoId = getYoutubeVideoId(youtube.videoUrl);
  const channelId = getYoutubeChannelId(youtube.channel);
  const embedSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}`
    : channelId
      ? `https://www.youtube.com/embed/live_stream?channel=${channelId}`
      : "";

  return (
    <div className="grid gap-5">
      <AdminSection
        title="Transmissão do canal"
        description="Preencha o canal ou o link da transmissão para exibir o player na página inicial. Enquanto estiver vazio, o bloco não aparece no site."
      >
        <TextField
          id="youtube-channel"
          label="Canal do YouTube (ID ou link)"
          value={youtube.channel}
          onChange={(value) => patch("channel", value)}
          placeholder="UCxxxxxxxxxxxxxxxxxxxxxx"
          hint="O ID do canal começa com “UC” e tem 24 caracteres. Use o link youtube.com/channel/UC... — links com @nome de usuário não permitem o player automático."
        />
        <TextField
          id="youtube-video"
          label="Link da transmissão ao vivo (opcional)"
          type="url"
          value={youtube.videoUrl}
          onChange={(value) => patch("videoUrl", value)}
          placeholder="https://www.youtube.com/watch?v=..."
          hint="Tem prioridade sobre o canal. Aceita links watch?v=, youtu.be, /live/ e /embed/."
        />
        <TextField
          id="youtube-channel-url"
          label="Link público do canal"
          type="url"
          value={youtube.channelUrl}
          onChange={(value) => patch("channelUrl", value)}
          placeholder="https://www.youtube.com/@seucanal"
          hint="Usado no botão “Abrir no YouTube”."
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
        title="Pré-visualização"
        description="O player abaixo é o mesmo exibido na página inicial."
      >
        {embedSrc ? (
          <iframe
            title="Pré-visualização da transmissão"
            src={embedSrc}
            className="aspect-video w-full rounded-2xl border border-border"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-background/60 p-5 text-sm leading-relaxed text-muted-foreground">
            Informe o ID do canal (UC...) ou o link de uma transmissão para ver
            o player aqui.
          </p>
        )}
      </AdminSection>
    </div>
  );
}
