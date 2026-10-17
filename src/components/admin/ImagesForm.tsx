import { AdminSection } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/ImageField";
import type { ImagesCopy, SiteContent } from "@/content/site";

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

export function ImagesForm({ content, onChange }: Props) {
  const patchImage = (key: keyof ImagesCopy, value: string) =>
    onChange({ ...content, images: { ...content.images, [key]: value } });

  return (
    <div className="grid gap-5">
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
            <div key={slot.key} className="rounded-2xl border border-border/70 bg-background/40 p-4">
              <ImageField
                id={`image-${slot.key}`}
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
