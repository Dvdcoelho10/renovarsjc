import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";

import { AdminSection, TextAreaField, TextField } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/ImageField";
import { createId } from "@/components/admin/utils";
import { Button } from "@/components/ui/button";
import type { PersonProfile, SiteContent } from "@/content/site";

type Props = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
};

function PersonCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-4 rounded-2xl border border-border/70 bg-background/40 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="rounded-full text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Remover
        </Button>
      </div>
      {children}
    </div>
  );
}

/**
 * Pastores e pastoras da página Sobre: título, introdução e, para cada pessoa,
 * função, nome, texto e foto. Usado na edição da própria página e na aba Sobre
 * do painel, para o administrador editar nos dois lugares.
 */
export function PastorsFields({ content, onChange }: Props) {
  const { about, pastors } = content;

  const patchAbout = (patch: Partial<SiteContent["about"]>) =>
    onChange({ ...content, about: { ...about, ...patch } });

  const patchPastor = (index: number, patch: Partial<PersonProfile>) =>
    onChange({
      ...content,
      pastors: pastors.map((person, position) =>
        position === index ? { ...person, ...patch } : person,
      ),
    });

  return (
    <AdminSection
      title="Pastores e pastoras"
      description="Função, nome, texto de apresentação e foto. A foto aparece no card da página Sobre; sem foto, o site mostra um ícone. Escreva apenas o que a liderança informar."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="about-pastors-title"
          label="Título da seção"
          value={about.pastorsTitle}
          onChange={(value) => patchAbout({ pastorsTitle: value })}
        />
        <TextField
          id="about-pastors-intro"
          label="Introdução"
          value={about.pastorsIntro}
          onChange={(value) => patchAbout({ pastorsIntro: value })}
        />
      </div>

      {pastors.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border bg-background/60 p-5 text-sm leading-relaxed text-muted-foreground">
          Nenhum pastor cadastrado. A seção fica oculta no site.
        </p>
      )}

      {pastors.map((person, index) => (
        <PersonCard
          key={person.id}
          title={person.name.trim() || `Apresentação ${index + 1}`}
          onRemove={() =>
            onChange({
              ...content,
              pastors: pastors.filter((_, position) => position !== index),
            })
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`pastor-role-${person.id}`}
              label="Função"
              value={person.role}
              onChange={(value) => patchPastor(index, { role: value })}
              placeholder="Pastor"
            />
            <TextField
              id={`pastor-name-${person.id}`}
              label="Nome"
              value={person.name}
              onChange={(value) => patchPastor(index, { name: value })}
              placeholder="Ricardo"
            />
          </div>

          <ImageField
            id={`pastor-photo-${person.id}`}
            label="Foto"
            value={person.photoUrl}
            onChange={(value) => patchPastor(index, { photoUrl: value })}
            hint="Retrato com autorização de uso. Sem foto, aparece um ícone."
            previewClassName="h-40"
          />

          <TextAreaField
            id={`pastor-bio-${person.id}`}
            label="Texto sobre a pessoa"
            value={person.bio}
            onChange={(value) => patchPastor(index, { bio: value })}
            rows={5}
            hint="Deixe vazio enquanto a liderança não enviar o texto."
          />
        </PersonCard>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          onChange({
            ...content,
            pastors: [
              ...pastors,
              {
                id: createId("pastor"),
                role: "",
                name: "",
                bio: "",
                photoUrl: "",
              },
            ],
          })
        }
        className="w-fit rounded-full border-border hover:bg-secondary"
      >
        <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Adicionar pastor
      </Button>
    </AdminSection>
  );
}
