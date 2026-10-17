import { useState } from "react";
import { Download } from "lucide-react";

import { AdminSection } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/button";
import type { ImagesCopy, SiteContent } from "@/content/site";
import {
  buildImagesZip,
  downloadBlob,
  type DownloadableImage,
} from "@/lib/images-download";

type Props = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
};

const slots: { key: keyof ImagesCopy; label: string; hint: string }[] = [
  {
    key: "homeHero",
    label: "Início — foto do destaque",
    hint: "Substitui a composição gráfica ao lado do título. Recomendado: foto horizontal, 1200 × 1500 px.",
  },
  {
    key: "homeMission",
    label: "Início — foto da missão",
    hint: "Substitui a ilustração da Bíblia no bloco de missão.",
  },
  {
    key: "aboutHero",
    label: "Sobre — foto de abertura",
    hint: "Aparece ao lado do título da página Sobre.",
  },
  {
    key: "aboutBible",
    label: "Sobre — foto do bloco da Bíblia",
    hint: "Substitui a ilustração da Bíblia na seção “A Bíblia como referência de fé”.",
  },
  {
    key: "agendaHero",
    label: "Agenda — foto de abertura",
    hint: "Aparece ao lado do título da página Agenda.",
  },
  {
    key: "messagesHero",
    label: "Mensagens — foto de abertura",
    hint: "Aparece ao lado do título da página Mensagens.",
  },
  {
    key: "contactHero",
    label: "Contato — foto de abertura",
    hint: "Aparece ao lado do título da página Contato.",
  },
];

const slotNames: Record<keyof ImagesCopy, string> = {
  homeHero: "inicio-destaque",
  homeMission: "inicio-missao",
  aboutHero: "sobre-abertura",
  aboutBible: "sobre-biblia",
  agendaHero: "agenda-abertura",
  messagesHero: "mensagens-abertura",
  contactHero: "contato-abertura",
};

function collectImages(content: SiteContent): DownloadableImage[] {
  return [
    {
      name: "logo-adr",
      url: content.church.logoUrl || "/logo-adr.png",
    },
    ...slots.map((slot) => ({
      name: `pagina-${slotNames[slot.key]}`,
      url: content.images[slot.key],
    })),
    ...content.events.map((event, index) => ({
      name: `agenda-${index + 1}-${event.title}`,
      url: event.imageUrl ?? "",
    })),
    ...content.messages.map((message, index) => ({
      name: `mensagem-${index + 1}-${message.title}`,
      url: message.imageUrl ?? "",
    })),
  ].filter((image) => image.url.trim().length > 0);
}

export function ImagesForm({ content, onChange }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState("");

  const patchImage = (key: keyof ImagesCopy, value: string) =>
    onChange({ ...content, images: { ...content.images, [key]: value } });

  const handleDownloadAll = async () => {
    setDownloading(true);
    setStatus("");

    const images = collectImages(content);
    const result = await buildImagesZip(images);

    setDownloading(false);

    if (!result.blob) {
      setStatus(
        images.length === 0
          ? "Nenhuma imagem configurada para baixar."
          : "Não foi possível baixar as imagens. Tente novamente.",
      );
      return;
    }

    downloadBlob(result.blob, "imagens-adr.zip");
    setStatus(
      `${result.count} imagem(ns) no ZIP${
        result.skipped > 0
          ? ` · ${result.skipped} link(s) externo(s) bloqueado(s) para download`
          : ""
      }.`,
    );
  };

  return (
    <div className="grid gap-5">
      <AdminSection
        title="Baixar imagens"
        description="Reúne logo, fotos das páginas, da agenda e das mensagens em um único ZIP."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handleDownloadAll}
            disabled={downloading}
            className="h-11 rounded-full px-5"
          >
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            {downloading ? "Preparando ZIP..." : "Baixar todas as imagens"}
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Também há um botão “Baixar” em cada imagem, abaixo.
          </p>
        </div>

        {status && (
          <p role="status" className="text-xs leading-relaxed text-muted-foreground">
            {status}
          </p>
        )}
      </AdminSection>

      <AdminSection
        title="Logo e identidade"
        description="A mesma logo é usada no cabeçalho, no rodapé, no emblema do destaque e como favicon do navegador."
      >
        <ImageField
          id="image-logo"
          label="Logo da igreja"
          value={content.church.logoUrl}
          onChange={(value) =>
            onChange({ ...content, church: { ...content.church, logoUrl: value } })
          }
          hint="Prefira PNG ou WebP com fundo transparente ou branco."
          previewClassName="h-32"
        />
      </AdminSection>

      <AdminSection
        title="Fotos das páginas"
        description="Troque, envie ou remova as fotos de cada página. Sem foto, o site mantém a composição gráfica atual."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {slots.map((slot) => (
            <div
              key={slot.key}
              id={`image-${slot.key}`}
              className="scroll-mt-24 rounded-2xl border border-border/70 bg-background/40 p-4"
            >
              <ImageField
                id={`image-${slot.key}-input`}
                label={slot.label}
                value={content.images[slot.key]}
                onChange={(value) => patchImage(slot.key, value)}
                hint={slot.hint}
              />
            </div>
          ))}
        </div>
      </AdminSection>

      <AdminSection
        title="Imagens de eventos e mensagens"
        description="As fotos de cada encontro e de cada publicação são definidas nas abas Agenda e Mensagens."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Use os campos “Imagem” em cada encontro ou mensagem para enviar uma
          foto do computador, trocar ou remover.
        </p>
      </AdminSection>
    </div>
  );
}
