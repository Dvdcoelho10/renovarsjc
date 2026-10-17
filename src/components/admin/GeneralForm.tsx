import { Plus, Trash2 } from "lucide-react";

import { AdminSection, TextAreaField, TextField } from "@/components/admin/fields";
import { Button } from "@/components/ui/button";
import type { SiteContent } from "@/content/site";

type Props = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
};

export function GeneralForm({ content, onChange }: Props) {
  const patchChurch = <K extends keyof SiteContent["church"]>(
    key: K,
    value: SiteContent["church"][K],
  ) => onChange({ ...content, church: { ...content.church, [key]: value } });

  const patchHome = <K extends keyof SiteContent["home"]>(
    key: K,
    value: SiteContent["home"][K],
  ) => onChange({ ...content, home: { ...content.home, [key]: value } });

  const patchAbout = <K extends keyof SiteContent["about"]>(
    key: K,
    value: SiteContent["about"][K],
  ) => onChange({ ...content, about: { ...content.about, [key]: value } });

  const patchParagraph = (index: number, value: string) => {
    const paragraphs = [...content.about.paragraphs];
    paragraphs[index] = value;
    patchAbout("paragraphs", paragraphs);
  };

  const addParagraph = () =>
    patchAbout("paragraphs", [...content.about.paragraphs, ""]);

  const removeParagraph = (index: number) =>
    patchAbout(
      "paragraphs",
      content.about.paragraphs.filter((_, position) => position !== index),
    );

  const patchArea = (
    index: number,
    key: "title" | "description",
    value: string,
  ) => {
    const ministryAreas = content.ministryAreas.map((area, position) =>
      position === index ? { ...area, [key]: value } : area,
    );
    onChange({ ...content, ministryAreas });
  };

  return (
    <div className="grid gap-5">
      <AdminSection
        title="Dados da igreja"
        description="Aparecem no cabeçalho, rodapé, página Sobre e nos títulos do site."
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
          <TextField
            id="church-logo"
            label="Logo (URL ou caminho)"
            value={content.church.logoUrl}
            onChange={(value) => patchChurch("logoUrl", value)}
            placeholder="/logo-adr.png"
            hint="Use /logo-adr.png para a logo enviada ou cole o link de outra imagem."
            type="url"
          />
        </div>
      </AdminSection>

      <AdminSection
        title="Página inicial"
        description="Destaque de abertura, mensagem de boas-vindas e apresentação da missão."
      >
        <TextField
          id="home-hero-eyebrow"
          label="Linha acima do título"
          value={content.home.heroEyebrow}
          onChange={(value) => patchHome("heroEyebrow", value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="home-hero-greeting"
            label="Saudação do título"
            value={content.home.heroGreeting}
            onChange={(value) => patchHome("heroGreeting", value)}
          />
          <TextField
            id="home-hero-title"
            label="Título em destaque"
            value={content.home.heroTitle}
            onChange={(value) => patchHome("heroTitle", value)}
          />
        </div>
        <TextAreaField
          id="home-welcome"
          label="Mensagem de boas-vindas"
          value={content.home.welcome}
          onChange={(value) => patchHome("welcome", value)}
        />
        <TextField
          id="home-mission-title"
          label="Título da missão"
          value={content.home.missionTitle}
          onChange={(value) => patchHome("missionTitle", value)}
        />
        <TextAreaField
          id="home-mission-lead"
          label="Missão — texto de destaque"
          value={content.home.missionLead}
          onChange={(value) => patchHome("missionLead", value)}
        />
        <TextAreaField
          id="home-mission-body"
          label="Missão — complemento"
          value={content.home.missionBody}
          onChange={(value) => patchHome("missionBody", value)}
        />
        <TextField
          id="home-invite-title"
          label="Convite final — título"
          value={content.home.inviteTitle}
          onChange={(value) => patchHome("inviteTitle", value)}
        />
        <TextAreaField
          id="home-invite-description"
          label="Convite final — texto"
          value={content.home.inviteDescription}
          onChange={(value) => patchHome("inviteDescription", value)}
        />
      </AdminSection>

      <AdminSection
        title="Página Sobre a igreja"
        description="Título, apresentação e avisos institucionais. O primeiro parágrafo da apresentação é montado com os dados da igreja."
      >
        <TextField
          id="about-title"
          label="Título da página"
          value={content.about.title}
          onChange={(value) => patchAbout("title", value)}
        />
        <TextAreaField
          id="about-description"
          label="Descrição de abertura"
          value={content.about.description}
          onChange={(value) => patchAbout("description", value)}
        />
        <TextAreaField
          id="about-bible"
          label="Texto sobre a Bíblia"
          value={content.about.bibleText}
          onChange={(value) => patchAbout("bibleText", value)}
        />

        <div className="grid gap-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Parágrafos adicionais
          </p>
          {content.about.paragraphs.map((paragraph, index) => (
            <div key={index} className="grid gap-2">
              <TextAreaField
                id={`about-paragraph-${index}`}
                label={`Parágrafo ${index + 1}`}
                value={paragraph}
                onChange={(value) => patchParagraph(index, value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeParagraph(index)}
                className="w-fit rounded-full text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Remover parágrafo
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addParagraph}
            className="w-fit rounded-full border-border hover:bg-secondary"
          >
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Adicionar parágrafo
          </Button>
        </div>

        <TextAreaField
          id="about-areas-note"
          label="Aviso sobre as áreas previstas"
          value={content.about.areasNote}
          onChange={(value) => patchAbout("areasNote", value)}
        />
        <TextAreaField
          id="about-content-note"
          label="Nota sobre o conteúdo da página"
          value={content.about.contentNote}
          onChange={(value) => patchAbout("contentNote", value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="about-invite-title"
            label="Convite final — título"
            value={content.about.inviteTitle}
            onChange={(value) => patchAbout("inviteTitle", value)}
          />
          <TextField
            id="about-invite-description"
            label="Convite final — texto"
            value={content.about.inviteDescription}
            onChange={(value) => patchAbout("inviteDescription", value)}
          />
        </div>
      </AdminSection>

      <AdminSection
        title="Áreas previstas no estatuto"
        description="Textos exibidos nos cards de Evangelização, Educação Cristã e Ação Social."
      >
        {content.ministryAreas.map((area, index) => (
          <div key={area.id} className="grid gap-4 border-b border-border/60 pb-4 last:border-0 last:pb-0">
            <TextField
              id={`area-title-${area.id}`}
              label={`Área ${index + 1} — título`}
              value={area.title}
              onChange={(value) => patchArea(index, "title", value)}
            />
            <TextAreaField
              id={`area-description-${area.id}`}
              label={`Área ${index + 1} — descrição`}
              value={area.description}
              onChange={(value) => patchArea(index, "description", value)}
            />
          </div>
        ))}
      </AdminSection>
    </div>
  );
}
