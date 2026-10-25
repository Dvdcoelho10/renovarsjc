import { AdminSection, TextAreaField, TextField } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/ImageField";
import { Switch } from "@/components/ui/switch";
import type { GivingCopy, SiteContent } from "@/content/site";

type Props = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
};

export function GivingForm({ content, onChange }: Props) {
  const giving = content.giving;

  const patch = <K extends keyof GivingCopy>(key: K, value: GivingCopy[K]) =>
    onChange({ ...content, giving: { ...giving, [key]: value } });

  return (
    <div className="grid gap-5">
      <AdminSection
        title="Dízimos e ofertas"
        description="Bloco com o QR Code Pix da igreja, exibido ao lado do último vídeo (abaixo dele no celular)."
      >
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/40 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Exibir o bloco de contribuições no site
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Desligue para ocultar o QR Code sem apagar a configuração.
            </p>
          </div>
          <Switch
            checked={giving.enabled}
            onCheckedChange={(checked) => patch("enabled", checked)}
            aria-label="Exibir o bloco de dízimos e ofertas no site"
          />
        </div>

        <TextField
          id="giving-title"
          label="Título do bloco"
          value={giving.title}
          onChange={(value) => patch("title", value)}
        />
        <TextAreaField
          id="giving-description"
          label="Instrução para quem vai contribuir"
          value={giving.description}
          onChange={(value) => patch("description", value)}
        />
        <TextField
          id="giving-legal-name"
          label="Nome na tarja do QR Code"
          value={giving.legalName}
          onChange={(value) => patch("legalName", value)}
        />
        <TextField
          id="giving-cnpj"
          label="CNPJ (chave Pix)"
          value={giving.cnpj}
          onChange={(value) => patch("cnpj", value)}
          hint="Aparece na tarja azul abaixo do QR Code e no botão de copiar."
        />
        <TextAreaField
          id="giving-note"
          label="Observação abaixo do botão"
          value={giving.note}
          onChange={(value) => patch("note", value)}
        />
      </AdminSection>

      <AdminSection
        title="QR Code Pix"
        description="Use a imagem do QR Code gerado para a conta da igreja. O código é lido pelo aplicativo do banco do visitante."
      >
        <ImageField
          id="giving-qr"
          label="Imagem do QR Code"
          value={giving.qrImageUrl}
          onChange={(value) => patch("qrImageUrl", value)}
          hint="Prefira uma imagem quadrada e nítida. Sem imagem, o bloco não aparece no site."
          previewClassName="aspect-square h-auto max-w-[13rem]"
        />
      </AdminSection>
    </div>
  );
}
