import {
  AboutCopyFields,
  HomeCopyFields,
  MinistryAreasFields,
  PageHeaderFields,
} from "@/components/admin/copy-fields";
import { ContactForm } from "@/components/admin/ContactForm";
import { EventsForm } from "@/components/admin/EventsForm";
import { AdminSection, TextAreaField, TextField } from "@/components/admin/fields";
import { HighlightsForm } from "@/components/admin/HighlightsForm";
import { ImageField } from "@/components/admin/ImageField";
import { MessagesForm } from "@/components/admin/MessagesForm";
import { Switch } from "@/components/ui/switch";
import type {
  ImagesCopy,
  PageHeaderCopy,
  PagesCopy,
  SiteContent,
} from "@/content/site";

export type EditablePage =
  | "home"
  | "about"
  | "agenda"
  | "messages"
  | "contact";

type Props = {
  page: EditablePage;
  draft: SiteContent;
  onChange: (next: SiteContent) => void;
};

export function PageEditorFields({ page, draft, onChange }: Props) {
  const patchImages = (key: keyof ImagesCopy, value: string) =>
    onChange({ ...draft, images: { ...draft.images, [key]: value } });

  const patchPageHeader = (key: keyof PagesCopy, value: PageHeaderCopy) =>
    onChange({ ...draft, pages: { ...draft.pages, [key]: value } });

  if (page === "home") {
    return (
      <div className="grid gap-5">
        <HomeCopyFields
          value={draft.home}
          onChange={(home) => onChange({ ...draft, home })}
        />

        <AdminSection
          title="Fotos da página inicial"
          description="Sem foto, o site mantém a composição gráfica com a logo da igreja."
        >
          <ImageField
            id="page-image-homeHero"
            label="Início — foto do destaque"
            value={draft.images.homeHero}
            onChange={(value) => patchImages("homeHero", value)}
            hint="Substitui o cartão azul com a logo ao lado do título."
          />
          <ImageField
            id="page-image-homeMission"
            label="Início — foto da missão"
            value={draft.images.homeMission}
            onChange={(value) => patchImages("homeMission", value)}
            hint="Substitui a ilustração da Bíblia no bloco de missão."
          />
        </AdminSection>

        <AdminSection
          title="Último vídeo do YouTube"
          description="O vídeo mais recente do canal aparece incorporado nesta página. Canal e chave ficam no servidor."
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
              checked={draft.youtube.enabled}
              onCheckedChange={(enabled) =>
                onChange({
                  ...draft,
                  youtube: { ...draft.youtube, enabled },
                })
              }
              aria-label="Exibir o último vídeo no site"
            />
          </div>
          <TextField
            id="page-youtube-title"
            label="Título do bloco"
            value={draft.youtube.title}
            onChange={(title) =>
              onChange({ ...draft, youtube: { ...draft.youtube, title } })
            }
          />
          <TextAreaField
            id="page-youtube-description"
            label="Descrição do bloco"
            value={draft.youtube.description}
            onChange={(description) =>
              onChange({
                ...draft,
                youtube: { ...draft.youtube, description },
              })
            }
          />
        </AdminSection>

        <HighlightsForm content={draft} onChange={onChange} />
      </div>
    );
  }

  if (page === "about") {
    return (
      <div className="grid gap-5">
        <AboutCopyFields
          value={draft.about}
          onChange={(about) => onChange({ ...draft, about })}
        />

        <MinistryAreasFields
          value={draft.ministryAreas}
          onChange={(ministryAreas) => onChange({ ...draft, ministryAreas })}
        />

        <AdminSection
          title="Fotos da página Sobre"
          description="A foto de abertura aparece ao lado do título; a segunda substitui a ilustração da Bíblia."
        >
          <ImageField
            id="page-image-aboutHero"
            label="Sobre — foto de abertura"
            value={draft.images.aboutHero}
            onChange={(value) => patchImages("aboutHero", value)}
          />
          <ImageField
            id="page-image-aboutBible"
            label="Sobre — foto do bloco da Bíblia"
            value={draft.images.aboutBible}
            onChange={(value) => patchImages("aboutBible", value)}
          />
        </AdminSection>
      </div>
    );
  }

  if (page === "agenda") {
    return (
      <div className="grid gap-5">
        <PageHeaderFields
          idPrefix="page-agenda"
          sectionTitle="Cabeçalho da página Agenda"
          value={draft.pages.agenda}
          onChange={(value) => patchPageHeader("agenda", value)}
        />

        <AdminSection
          title="Foto de abertura"
          description="Aparece ao lado do título da página Agenda."
        >
          <ImageField
            id="page-image-agendaHero"
            label="Agenda — foto de abertura"
            value={draft.images.agendaHero}
            onChange={(value) => patchImages("agendaHero", value)}
          />
        </AdminSection>

        <EventsForm content={draft} onChange={onChange} />
      </div>
    );
  }

  if (page === "messages") {
    return (
      <div className="grid gap-5">
        <PageHeaderFields
          idPrefix="page-messages"
          sectionTitle="Cabeçalho da página Mensagens"
          value={draft.pages.messages}
          onChange={(value) => patchPageHeader("messages", value)}
        />

        <AdminSection
          title="Foto de abertura"
          description="Aparece ao lado do título da página Mensagens."
        >
          <ImageField
            id="page-image-messagesHero"
            label="Mensagens — foto de abertura"
            value={draft.images.messagesHero}
            onChange={(value) => patchImages("messagesHero", value)}
          />
        </AdminSection>

        <MessagesForm content={draft} onChange={onChange} />
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <PageHeaderFields
        idPrefix="page-contact"
        sectionTitle="Cabeçalho da página Contato"
        value={draft.pages.contact}
        onChange={(value) => patchPageHeader("contact", value)}
      />

      <AdminSection
        title="Foto de abertura"
        description="Aparece ao lado do título da página Contato."
      >
        <ImageField
          id="page-image-contactHero"
          label="Contato — foto de abertura"
          value={draft.images.contactHero}
          onChange={(value) => patchImages("contactHero", value)}
        />
      </AdminSection>

      <ContactForm content={draft} onChange={onChange} />
    </div>
  );
}
