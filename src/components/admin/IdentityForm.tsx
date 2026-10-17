import { AdminSection, TextField } from "@/components/admin/fields";
import { ImageArchivePanel } from "@/components/admin/ImageArchivePanel";
import { ImageField } from "@/components/admin/ImageField";
import type { SiteContent } from "@/content/site";

type Props = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
};

export function IdentityForm({ content, onChange }: Props) {
  const patchChurch = <K extends keyof SiteContent["church"]>(
    key: K,
    value: SiteContent["church"][K],
  ) => onChange({ ...content, church: { ...content.church, [key]: value } });

  return (
    <div className="grid gap-5">
      <AdminSection
        title="Dados da igreja"
        description="Aparecem no cabeçalho, rodapé, página Sobre, no cartão do destaque e nos títulos do site."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="church-name"
            label="Nome completo"
            value={content.church.name}
            onChange={(value) => patchChurch("name", value)}
          />
          <TextField
            id="church-short"
            label="Nome curto"
            value={content.church.shortName}
            onChange={(value) => patchChurch("shortName", value)}
          />
          <TextField
            id="church-acronym"
            label="Sigla"
            value={content.church.acronym}
            onChange={(value) => patchChurch("acronym", value)}
          />
          <TextField
            id="church-founded"
            label="Fundação"
            value={content.church.foundedAt}
            onChange={(value) => patchChurch("foundedAt", value)}
          />
          <TextField
            id="church-city"
            label="Cidade"
            value={content.church.city}
            onChange={(value) => patchChurch("city", value)}
          />
          <TextField
            id="church-state"
            label="Estado"
            value={content.church.state}
            onChange={(value) => patchChurch("state", value)}
          />
          <TextField
            id="church-nature"
            label="Natureza jurídica"
            value={content.church.legalNature}
            onChange={(value) => patchChurch("legalNature", value)}
          />
          <TextField
            id="church-mission-statement"
            label="Frase de missão (menu e rodapé)"
            value={content.church.missionStatement}
            onChange={(value) => patchChurch("missionStatement", value)}
          />
        </div>
      </AdminSection>

      <AdminSection
        title="Logo e identidade"
        description="A mesma logo é usada no cabeçalho, rodapé, favicon e no cartão do destaque da página inicial."
      >
        <ImageField
          id="identity-logo"
          label="Logo da igreja"
          value={content.church.logoUrl}
          onChange={(value) => patchChurch("logoUrl", value)}
          hint="Prefira PNG ou WebP com fundo transparente ou branco."
          previewClassName="h-32"
        />
      </AdminSection>

      <ImageArchivePanel content={content} />
    </div>
  );
}
