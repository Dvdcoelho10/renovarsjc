import { useState } from "react";
import { Download } from "lucide-react";

import { AdminSection } from "@/components/admin/fields";
import { Button } from "@/components/ui/button";
import type { ImagesCopy, SiteContent } from "@/content/site";
import {
  buildImagesZip,
  downloadBlob,
  type DownloadableImage,
} from "@/lib/images-download";

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
    ...(Object.keys(slotNames) as (keyof ImagesCopy)[]).map((key) => ({
      name: `pagina-${slotNames[key]}`,
      url: content.images[key],
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

export function ImageArchivePanel({ content }: { content: SiteContent }) {
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState("");

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
          Também há um botão “Baixar” em cada campo de imagem, dentro das abas
          das páginas.
        </p>
      </div>

      {status && (
        <p role="status" className="text-xs leading-relaxed text-muted-foreground">
          {status}
        </p>
      )}
    </AdminSection>
  );
}
