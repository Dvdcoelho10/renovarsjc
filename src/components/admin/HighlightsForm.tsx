import { Plus, Trash2 } from "lucide-react";

import { AdminSection, TextAreaField, TextField } from "@/components/admin/fields";
import { createId } from "@/components/admin/utils";
import { Button } from "@/components/ui/button";
import type { Highlight, SiteContent } from "@/content/site";

type Props = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
};

export function HighlightsForm({ content, onChange }: Props) {
  const highlights = content.highlights;

  const patchHighlight = <K extends keyof Highlight>(
    index: number,
    key: K,
    value: Highlight[K],
  ) =>
    onChange({
      ...content,
      highlights: highlights.map((highlight, position) =>
        position === index ? { ...highlight, [key]: value } : highlight,
      ),
    });

  const addHighlight = () =>
    onChange({
      ...content,
      highlights: [
        ...highlights,
        {
          id: createId("highlight"),
          title: "",
          description: "",
          linkLabel: "",
          linkUrl: "",
        },
      ],
    });

  const removeHighlight = (index: number) =>
    onChange({
      ...content,
      highlights: highlights.filter((_, position) => position !== index),
    });

  return (
    <AdminSection
      title="Destaques"
      description="Avisos e informações exibidos na página inicial, na seção “Informações da igreja”."
    >
      {highlights.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border bg-background/60 p-5 text-sm leading-relaxed text-muted-foreground">
          Nenhum destaque publicado. A página inicial mostra um aviso de que
          ainda não há destaques.
        </p>
      )}

      {highlights.map((highlight, index) => (
        <div
          key={highlight.id}
          className="grid gap-4 rounded-2xl border border-border/70 bg-background/40 p-4 sm:p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-foreground">
              Destaque {index + 1}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeHighlight(index)}
              className="rounded-full text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Remover
            </Button>
          </div>

          <TextField
            id={`highlight-title-${highlight.id}`}
            label="Título"
            value={highlight.title}
            onChange={(value) => patchHighlight(index, "title", value)}
          />
          <TextAreaField
            id={`highlight-description-${highlight.id}`}
            label="Descrição"
            value={highlight.description}
            onChange={(value) => patchHighlight(index, "description", value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`highlight-link-label-${highlight.id}`}
              label="Texto do link"
              value={highlight.linkLabel ?? ""}
              onChange={(value) => patchHighlight(index, "linkLabel", value)}
              placeholder="Saiba mais"
            />
            <TextField
              id={`highlight-link-${highlight.id}`}
              label="Link (URL)"
              type="url"
              value={highlight.linkUrl ?? ""}
              onChange={(value) => patchHighlight(index, "linkUrl", value)}
              placeholder="https://..."
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addHighlight}
        className="w-fit rounded-full border-border hover:bg-secondary"
      >
        <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Adicionar destaque
      </Button>
    </AdminSection>
  );
}
