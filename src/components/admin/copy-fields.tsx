import { Plus, Trash2 } from "lucide-react";

import { AdminSection, TextAreaField, TextField } from "@/components/admin/fields";
import { Button } from "@/components/ui/button";
import type {
  AboutCopy,
  HomeCopy,
  MinistryArea,
  PageHeaderCopy,
} from "@/content/site";

type SectionProps<T> = {
  value: T;
  onChange: (next: T) => void;
};

export function PageHeaderFields({
  idPrefix,
  sectionTitle,
  sectionDescription,
  value,
  onChange,
}: SectionProps<PageHeaderCopy> & {
  idPrefix: string;
  sectionTitle: string;
  sectionDescription?: string;
}) {
  return (
    <AdminSection
      title={sectionTitle}
      description={
        sectionDescription ??
        "Textos exibidos no topo da página, ao lado da foto de abertura."
      }
    >
      <TextField
        id={`${idPrefix}-eyebrow`}
        label="Linha acima do título"
        value={value.eyebrow}
        onChange={(eyebrow) => onChange({ ...value, eyebrow })}
      />
      <TextField
        id={`${idPrefix}-title`}
        label="Título da página"
        value={value.title}
        onChange={(title) => onChange({ ...value, title })}
      />
      <TextAreaField
        id={`${idPrefix}-description`}
        label="Descrição de abertura"
        value={value.description}
        onChange={(description) => onChange({ ...value, description })}
      />
    </AdminSection>
  );
}

export function HomeCopyFields({ value, onChange }: SectionProps<HomeCopy>) {
  const patch = <K extends keyof HomeCopy>(key: K, next: HomeCopy[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <AdminSection
      title="Página inicial"
      description="Destaque de abertura, mensagem de boas-vindas e apresentação da missão."
    >
      <TextField
        id="home-hero-eyebrow"
        label="Linha acima do título"
        value={value.heroEyebrow}
        onChange={(next) => patch("heroEyebrow", next)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="home-hero-greeting"
          label="Saudação do título"
          value={value.heroGreeting}
          onChange={(next) => patch("heroGreeting", next)}
        />
        <TextField
          id="home-hero-title"
          label="Título em destaque"
          value={value.heroTitle}
          onChange={(next) => patch("heroTitle", next)}
        />
      </div>
      <TextAreaField
        id="home-welcome"
        label="Mensagem de boas-vindas"
        value={value.welcome}
        onChange={(next) => patch("welcome", next)}
      />
      <TextField
        id="home-mission-title"
        label="Título da missão"
        value={value.missionTitle}
        onChange={(next) => patch("missionTitle", next)}
      />
      <TextAreaField
        id="home-mission-lead"
        label="Missão — texto de destaque"
        value={value.missionLead}
        onChange={(next) => patch("missionLead", next)}
      />
      <TextAreaField
        id="home-mission-body"
        label="Missão — complemento"
        value={value.missionBody}
        onChange={(next) => patch("missionBody", next)}
      />
      <TextField
        id="home-invite-title"
        label="Convite final — título"
        value={value.inviteTitle}
        onChange={(next) => patch("inviteTitle", next)}
      />
      <TextAreaField
        id="home-invite-description"
        label="Convite final — texto"
        value={value.inviteDescription}
        onChange={(next) => patch("inviteDescription", next)}
      />
    </AdminSection>
  );
}

export function AboutCopyFields({ value, onChange }: SectionProps<AboutCopy>) {
  const patch = <K extends keyof AboutCopy>(key: K, next: AboutCopy[K]) =>
    onChange({ ...value, [key]: next });

  const patchParagraph = (index: number, paragraph: string) => {
    const paragraphs = [...value.paragraphs];
    paragraphs[index] = paragraph;
    patch("paragraphs", paragraphs);
  };

  return (
    <AdminSection
      title="Página Sobre a igreja"
      description="Título, apresentação e avisos institucionais. O primeiro parágrafo da apresentação é montado com os dados da igreja."
    >
      <TextField
        id="about-eyebrow"
        label="Linha acima do título"
        value={value.eyebrow}
        onChange={(next) => patch("eyebrow", next)}
      />
      <TextField
        id="about-title"
        label="Título da página"
        value={value.title}
        onChange={(next) => patch("title", next)}
      />
      <TextAreaField
        id="about-description"
        label="Descrição de abertura"
        value={value.description}
        onChange={(next) => patch("description", next)}
      />
      <TextAreaField
        id="about-bible"
        label="Texto sobre a Bíblia"
        value={value.bibleText}
        onChange={(next) => patch("bibleText", next)}
      />

      <div className="grid gap-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Parágrafos adicionais
        </p>
        {value.paragraphs.map((paragraph, index) => (
          <div key={index} className="grid gap-2">
            <TextAreaField
              id={`about-paragraph-${index}`}
              label={`Parágrafo ${index + 1}`}
              value={paragraph}
              onChange={(next) => patchParagraph(index, next)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                patch(
                  "paragraphs",
                  value.paragraphs.filter((_, position) => position !== index),
                )
              }
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
          onClick={() => patch("paragraphs", [...value.paragraphs, ""])}
          className="w-fit rounded-full border-border hover:bg-secondary"
        >
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Adicionar parágrafo
        </Button>
      </div>

      <TextAreaField
        id="about-areas-note"
        label="Aviso sobre as áreas previstas"
        value={value.areasNote}
        onChange={(next) => patch("areasNote", next)}
      />
      <TextAreaField
        id="about-content-note"
        label="Nota sobre o conteúdo da página"
        value={value.contentNote}
        onChange={(next) => patch("contentNote", next)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="about-invite-title"
          label="Convite final — título"
          value={value.inviteTitle}
          onChange={(next) => patch("inviteTitle", next)}
        />
        <TextField
          id="about-invite-description"
          label="Convite final — texto"
          value={value.inviteDescription}
          onChange={(next) => patch("inviteDescription", next)}
        />
      </div>
    </AdminSection>
  );
}

export function MinistryAreasFields({
  value,
  onChange,
}: SectionProps<MinistryArea[]>) {
  const patchArea = (
    index: number,
    key: "title" | "description",
    next: string,
  ) =>
    onChange(
      value.map((area, position) =>
        position === index ? { ...area, [key]: next } : area,
      ),
    );

  return (
    <AdminSection
      title="Áreas previstas no estatuto"
      description="Textos exibidos nos cards de Evangelização, Educação Cristã e Ação Social."
    >
      {value.map((area, index) => (
        <div
          key={area.id}
          className="grid gap-4 border-b border-border/60 pb-4 last:border-0 last:pb-0"
        >
          <TextField
            id={`area-title-${area.id}`}
            label={`Área ${index + 1} — título`}
            value={area.title}
            onChange={(next) => patchArea(index, "title", next)}
          />
          <TextAreaField
            id={`area-description-${area.id}`}
            label={`Área ${index + 1} — descrição`}
            value={area.description}
            onChange={(next) => patchArea(index, "description", next)}
          />
        </div>
      ))}
    </AdminSection>
  );
}
