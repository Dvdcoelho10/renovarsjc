import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";

import { AdminSection, TextAreaField, TextField } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/ImageField";
import { createId } from "@/components/admin/utils";
import { Button } from "@/components/ui/button";
import type {
  BeliefItem,
  HistoryMilestone,
  Ministry,
  PersonProfile,
  SiteContent,
} from "@/content/site";

type Props = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
};

function ListCard({
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

function EmptyList({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-border bg-background/60 p-5 text-sm leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

export function InstitutionalForm({ content, onChange }: Props) {
  const { about, history, pastors, ministries, creed, links } = content;

  const patchAbout = <K extends keyof SiteContent["about"]>(
    key: K,
    value: SiteContent["about"][K],
  ) => onChange({ ...content, about: { ...about, [key]: value } });

  const patchHistory = (index: number, patch: Partial<HistoryMilestone>) =>
    onChange({
      ...content,
      history: history.map((item, position) =>
        position === index ? { ...item, ...patch } : item,
      ),
    });

  const patchPastor = (index: number, patch: Partial<PersonProfile>) =>
    onChange({
      ...content,
      pastors: pastors.map((item, position) =>
        position === index ? { ...item, ...patch } : item,
      ),
    });

  const patchMinistry = (index: number, patch: Partial<Ministry>) =>
    onChange({
      ...content,
      ministries: ministries.map((item, position) =>
        position === index ? { ...item, ...patch } : item,
      ),
    });

  const patchBelief = (index: number, patch: Partial<BeliefItem>) =>
    onChange({
      ...content,
      creed: creed.map((item, position) =>
        position === index ? { ...item, ...patch } : item,
      ),
    });

  const patchLink = <K extends keyof SiteContent["links"]>(
    key: K,
    value: SiteContent["links"][K],
  ) => onChange({ ...content, links: { ...links, [key]: value } });

  return (
    <div className="grid gap-5">
      <AdminSection
        title="Nossa história"
        description="Cada item aparece na linha do tempo da página Sobre. Cadastre apenas marcos confirmados pela igreja."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="about-history-title"
            label="Título da seção"
            value={about.historyTitle}
            onChange={(value) => patchAbout("historyTitle", value)}
          />
          <TextField
            id="about-history-description"
            label="Introdução"
            value={about.historyDescription}
            onChange={(value) => patchAbout("historyDescription", value)}
          />
        </div>

        {history.length === 0 && (
          <EmptyList>
            Nenhum marco cadastrado. A linha do tempo fica oculta até existir
            conteúdo confirmado.
          </EmptyList>
        )}

        {history.map((item, index) => (
          <ListCard
            key={item.id}
            title={`Marco ${index + 1}`}
            onRemove={() =>
              onChange({
                ...content,
                history: history.filter((_, position) => position !== index),
              })
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id={`history-year-${item.id}`}
                label="Data ou ano"
                value={item.year}
                onChange={(value) => patchHistory(index, { year: value })}
                placeholder="23 de setembro de 2013"
              />
              <TextField
                id={`history-title-${item.id}`}
                label="Título"
                value={item.title}
                onChange={(value) => patchHistory(index, { title: value })}
                placeholder="Fundação da igreja"
              />
            </div>
            <TextAreaField
              id={`history-description-${item.id}`}
              label="Descrição"
              value={item.description}
              onChange={(value) => patchHistory(index, { description: value })}
            />
          </ListCard>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            onChange({
              ...content,
              history: [
                ...history,
                {
                  id: createId("history"),
                  year: "",
                  title: "",
                  description: "",
                },
              ],
            })
          }
          className="w-fit rounded-full border-border hover:bg-secondary"
        >
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Adicionar marco
        </Button>
      </AdminSection>

      <AdminSection
        title="Pastores e pastoras"
        description="Nomes, função e biografia. Escreva apenas o que a liderança informar — nada é completado automaticamente."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="about-pastors-title"
            label="Título da seção"
            value={about.pastorsTitle}
            onChange={(value) => patchAbout("pastorsTitle", value)}
          />
          <TextField
            id="about-pastors-intro"
            label="Introdução"
            value={about.pastorsIntro}
            onChange={(value) => patchAbout("pastorsIntro", value)}
          />
        </div>

        {pastors.length === 0 && (
          <EmptyList>
            Nenhum pastor cadastrado. A seção fica oculta no site.
          </EmptyList>
        )}

        {pastors.map((person, index) => (
          <ListCard
            key={person.id}
            title={`Apresentação ${index + 1}`}
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
            <TextAreaField
              id={`pastor-bio-${person.id}`}
              label="Quem é e história"
              value={person.bio}
              onChange={(value) => patchPastor(index, { bio: value })}
              rows={5}
              hint="Deixe vazio enquanto a liderança não enviar o texto."
            />
            <ImageField
              id={`pastor-photo-${person.id}`}
              label="Foto"
              value={person.photoUrl}
              onChange={(value) => patchPastor(index, { photoUrl: value })}
              hint="Retrato com autorização de uso. Sem foto, aparece um ícone."
              previewClassName="h-32"
            />
          </ListCard>
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

      <AdminSection
        title="Ministérios e líderes"
        description="A seção aparece no site quando existir pelo menos um ministério. Deixe o líder em branco se ainda não foi definido."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="about-ministries-title"
            label="Título da seção"
            value={about.ministriesTitle}
            onChange={(value) => patchAbout("ministriesTitle", value)}
          />
          <TextField
            id="about-ministries-intro"
            label="Introdução"
            value={about.ministriesIntro}
            onChange={(value) => patchAbout("ministriesIntro", value)}
          />
        </div>

        {ministries.length === 0 && (
          <EmptyList>
            Nenhum ministério cadastrado. Nada é exibido no site até a liderança
            confirmar os ministérios e seus líderes.
          </EmptyList>
        )}

        {ministries.map((ministry, index) => (
          <ListCard
            key={ministry.id}
            title={`Ministério ${index + 1}`}
            onRemove={() =>
              onChange({
                ...content,
                ministries: ministries.filter(
                  (_, position) => position !== index,
                ),
              })
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id={`ministry-title-${ministry.id}`}
                label="Ministério"
                value={ministry.title}
                onChange={(value) => patchMinistry(index, { title: value })}
                placeholder="Louvor"
              />
              <TextField
                id={`ministry-leader-${ministry.id}`}
                label="Líder responsável"
                value={ministry.leader}
                onChange={(value) => patchMinistry(index, { leader: value })}
                placeholder="Nome do líder"
              />
            </div>
            <TextAreaField
              id={`ministry-description-${ministry.id}`}
              label="Descrição"
              value={ministry.description}
              onChange={(value) =>
                patchMinistry(index, { description: value })
              }
            />
          </ListCard>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            onChange({
              ...content,
              ministries: [
                ...ministries,
                {
                  id: createId("ministry"),
                  title: "",
                  leader: "",
                  description: "",
                },
              ],
            })
          }
          className="w-fit rounded-full border-border hover:bg-secondary"
        >
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Adicionar ministério
        </Button>
      </AdminSection>

      <AdminSection
        title="Nosso Cremos"
        description="Pontos de fé na ordem em que devem aparecer. A seção fica oculta enquanto não houver nenhum item."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="about-creed-title"
            label="Título da seção"
            value={about.creedTitle}
            onChange={(value) => patchAbout("creedTitle", value)}
          />
          <TextField
            id="about-creed-intro"
            label="Introdução"
            value={about.creedIntro}
            onChange={(value) => patchAbout("creedIntro", value)}
          />
        </div>

        {creed.length === 0 && (
          <EmptyList>
            Nenhum ponto de fé cadastrado. Publique somente o texto aprovado
            pela liderança.
          </EmptyList>
        )}

        {creed.map((item, index) => (
          <ListCard
            key={item.id}
            title={`Ponto de fé ${index + 1}`}
            onRemove={() =>
              onChange({
                ...content,
                creed: creed.filter((_, position) => position !== index),
              })
            }
          >
            <TextField
              id={`belief-title-${item.id}`}
              label="Título"
              value={item.title}
              onChange={(value) => patchBelief(index, { title: value })}
              placeholder="Na Bíblia como Palavra de Deus"
            />
            <TextAreaField
              id={`belief-description-${item.id}`}
              label="Texto"
              value={item.description}
              onChange={(value) => patchBelief(index, { description: value })}
              rows={4}
            />
          </ListCard>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            onChange({
              ...content,
              creed: [
                ...creed,
                { id: createId("belief"), title: "", description: "" },
              ],
            })
          }
          className="w-fit rounded-full border-border hover:bg-secondary"
        >
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Adicionar ponto de fé
        </Button>
      </AdminSection>

      <AdminSection
        title="Nosso estatuto"
        description="Resumo institucional. O documento completo continua fora do site — não há download nem reprodução integral."
      >
        <TextField
          id="about-statute-title"
          label="Título da seção"
          value={about.statuteTitle}
          onChange={(value) => patchAbout("statuteTitle", value)}
        />

        {about.statuteSummary.map((paragraph, index) => (
          <div key={index} className="grid gap-2">
            <TextAreaField
              id={`statute-paragraph-${index}`}
              label={`Parágrafo ${index + 1}`}
              value={paragraph}
              onChange={(value) =>
                patchAbout(
                  "statuteSummary",
                  about.statuteSummary.map((item, position) =>
                    position === index ? value : item,
                  ),
                )
              }
              rows={4}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                patchAbout(
                  "statuteSummary",
                  about.statuteSummary.filter(
                    (_, position) => position !== index,
                  ),
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
          onClick={() =>
            patchAbout("statuteSummary", [...about.statuteSummary, ""])
          }
          className="w-fit rounded-full border-border hover:bg-secondary"
        >
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Adicionar parágrafo
        </Button>

        <TextAreaField
          id="about-statute-note"
          label="Aviso sobre o documento"
          value={about.statuteNote}
          onChange={(value) => patchAbout("statuteNote", value)}
        />
      </AdminSection>

      <AdminSection
        title="Missão e links institucionais"
        description="Além do texto de missão, estes campos alimentam os botões do bloco da Bíblia. Os botões só aparecem quando o link é preenchido."
      >
        <TextField
          id="about-mission-title"
          label="Título do bloco de missão"
          value={about.missionTitle}
          onChange={(value) => patchAbout("missionTitle", value)}
        />
        <TextAreaField
          id="about-mission-body"
          label="Texto da missão"
          value={about.missionBody}
          onChange={(value) => patchAbout("missionBody", value)}
          rows={4}
        />
        <TextField
          id="about-mission-note"
          label="Observação sobre o projeto Renovar Nações"
          value={about.missionNationsNote}
          onChange={(value) => patchAbout("missionNationsNote", value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="links-nations-label"
            label="Nome do projeto"
            value={links.nationsLabel}
            onChange={(value) => patchLink("nationsLabel", value)}
            placeholder="Renovar Nações"
          />
          <TextField
            id="links-nations-url"
            label="Link do site do projeto"
            type="url"
            value={links.nationsUrl}
            onChange={(value) => patchLink("nationsUrl", value)}
            placeholder="https://..."
            hint="Cole o endereço oficial enviado pela liderança."
          />
          <TextField
            id="links-bible-label"
            label="Nome do link da Bíblia"
            value={links.bibleLabel}
            onChange={(value) => patchLink("bibleLabel", value)}
            placeholder="Ler a Bíblia on-line"
          />
          <TextField
            id="links-bible-url"
            label="Link da Bíblia"
            type="url"
            value={links.bibleUrl}
            onChange={(value) => patchLink("bibleUrl", value)}
            placeholder="https://..."
          />
        </div>
      </AdminSection>
    </div>
  );
}
