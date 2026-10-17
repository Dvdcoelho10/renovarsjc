import { Plus, Trash2 } from "lucide-react";

import { AdminSection, TextAreaField, TextField } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/button";
import type { CustomPage } from "@/content/site";

type Props = {
  page: CustomPage;
  onChange: (next: CustomPage) => void;
};

export function newSectionId() {
  return `section-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export function CustomPageFields({ page, onChange }: Props) {
  const patch = <K extends keyof CustomPage>(key: K, value: CustomPage[K]) =>
    onChange({ ...page, [key]: value });

  const patchSection = (
    id: string,
    key: "heading" | "body",
    value: string,
  ) =>
    patch(
      "sections",
      page.sections.map((section) =>
        section.id === id ? { ...section, [key]: value } : section,
      ),
    );

  return (
    <div className="grid gap-5">
      <AdminSection
        title="Menu do cabeçalho"
        description={`A página abre em /pagina/${page.slug} e aparece no menu do site, no cabeçalho e no rodapé.`}
      >
        <TextField
          id={`custom-menu-${page.id}`}
          label="Nome no menu"
          value={page.menuLabel}
          onChange={(value) => patch("menuLabel", value)}
          hint="Texto curto exibido no menu. O endereço da página não muda ao renomear."
        />
      </AdminSection>

      <AdminSection
        title="Abertura da página"
        description="Textos exibidos no topo da página, ao lado da foto de abertura."
      >
        <TextField
          id={`custom-eyebrow-${page.id}`}
          label="Linha acima do título"
          value={page.eyebrow}
          onChange={(value) => patch("eyebrow", value)}
          placeholder="Ex.: Nossa história"
        />
        <TextField
          id={`custom-title-${page.id}`}
          label="Título da página"
          value={page.title}
          onChange={(value) => patch("title", value)}
        />
        <TextAreaField
          id={`custom-description-${page.id}`}
          label="Descrição de abertura"
          value={page.description}
          onChange={(value) => patch("description", value)}
        />
      </AdminSection>

      <AdminSection
        title="Foto de abertura"
        description="Sem foto, a página mantém apenas os textos de abertura."
      >
        <ImageField
          id={`custom-image-${page.id}`}
          label="Foto de abertura da página"
          value={page.imageUrl}
          onChange={(value) => patch("imageUrl", value)}
        />
      </AdminSection>

      <AdminSection
        title="Conteúdo da página"
        description="Cada bloco tem um subtítulo e um texto. Use uma linha em branco para separar parágrafos."
      >
        {page.sections.length === 0 && (
          <p className="rounded-xl border border-dashed border-border bg-background/60 p-4 text-sm leading-relaxed text-muted-foreground">
            Nenhum bloco de texto. Adicione o primeiro conteúdo abaixo.
          </p>
        )}

        {page.sections.map((section, index) => (
          <div
            key={section.id}
            className="grid gap-3 border-b border-border/60 pb-5 last:border-0 last:pb-0"
          >
            <TextField
              id={`custom-section-heading-${section.id}`}
              label={`Bloco ${index + 1} — subtítulo`}
              value={section.heading}
              onChange={(value) => patchSection(section.id, "heading", value)}
            />
            <TextAreaField
              id={`custom-section-body-${section.id}`}
              label={`Bloco ${index + 1} — texto`}
              value={section.body}
              onChange={(value) => patchSection(section.id, "body", value)}
              rows={5}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                patch(
                  "sections",
                  page.sections.filter((item) => item.id !== section.id),
                )
              }
              className="w-fit rounded-full text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Remover bloco
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            patch("sections", [
              ...page.sections,
              { id: newSectionId(), heading: "", body: "" },
            ])
          }
          className="w-fit rounded-full border-border hover:bg-secondary"
        >
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Adicionar bloco de texto
        </Button>
      </AdminSection>
    </div>
  );
}
