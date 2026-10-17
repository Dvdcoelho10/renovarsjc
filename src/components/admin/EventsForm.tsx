import { Plus, Trash2 } from "lucide-react";

import { AdminSection, TextAreaField, TextField } from "@/components/admin/fields";
import { createId } from "@/components/admin/utils";
import { Button } from "@/components/ui/button";
import type { EventItem, SiteContent } from "@/content/site";

type Props = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
};

export function EventsForm({ content, onChange }: Props) {
  const events = content.events;

  const patchEvent = <K extends keyof EventItem>(
    index: number,
    key: K,
    value: EventItem[K],
  ) => {
    onChange({
      ...content,
      events: events.map((event, position) =>
        position === index ? { ...event, [key]: value } : event,
      ),
    });
  };

  const addEvent = () =>
    onChange({
      ...content,
      events: [
        ...events,
        {
          id: createId("event"),
          title: "",
          date: "",
          time: "",
          location: "",
          description: "",
          imageUrl: "",
        },
      ],
    });

  const removeEvent = (index: number) =>
    onChange({
      ...content,
      events: events.filter((_, position) => position !== index),
    });

  return (
    <AdminSection
      title="Cultos e agenda"
      description="A página Agenda e o item no menu aparecem apenas quando existir pelo menos um encontro cadastrado."
    >
      {events.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border bg-background/60 p-5 text-sm leading-relaxed text-muted-foreground">
          Nenhum encontro cadastrado. Cadastre apenas horários confirmados pela
          igreja.
        </p>
      )}

      {events.map((event, index) => (
        <div
          key={event.id}
          className="grid gap-4 rounded-2xl border border-border/70 bg-background/40 p-4 sm:p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-foreground">
              Encontro {index + 1}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeEvent(index)}
              className="rounded-full text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Remover
            </Button>
          </div>

          <TextField
            id={`event-title-${event.id}`}
            label="Título"
            value={event.title}
            onChange={(value) => patchEvent(index, "title", value)}
            placeholder="Culto de celebração"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`event-date-${event.id}`}
              label="Data"
              type="date"
              value={event.date}
              onChange={(value) => patchEvent(index, "date", value)}
            />
            <TextField
              id={`event-time-${event.id}`}
              label="Horário"
              value={event.time ?? ""}
              onChange={(value) => patchEvent(index, "time", value)}
              placeholder="19h30"
            />
          </div>

          <TextField
            id={`event-location-${event.id}`}
            label="Local"
            value={event.location ?? ""}
            onChange={(value) => patchEvent(index, "location", value)}
            placeholder="Templo da igreja"
          />
          <TextAreaField
            id={`event-description-${event.id}`}
            label="Descrição"
            value={event.description ?? ""}
            onChange={(value) => patchEvent(index, "description", value)}
          />
          <TextField
            id={`event-image-${event.id}`}
            label="Imagem (URL)"
            type="url"
            value={event.imageUrl ?? ""}
            onChange={(value) => patchEvent(index, "imageUrl", value)}
            placeholder="https://.../foto.jpg"
            hint="Cole o link de uma foto real da igreja."
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addEvent}
        className="w-fit rounded-full border-border hover:bg-secondary"
      >
        <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Adicionar encontro
      </Button>
    </AdminSection>
  );
}
