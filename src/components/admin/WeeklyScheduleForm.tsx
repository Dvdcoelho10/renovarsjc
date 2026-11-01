import { Plus, Trash2 } from "lucide-react";

import { AdminSection, TextAreaField, TextField } from "@/components/admin/fields";
import { createId } from "@/components/admin/utils";
import { Button } from "@/components/ui/button";
import type { SiteContent, WeeklyMeeting } from "@/content/site";

type Props = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
};

export function WeeklyScheduleForm({ content, onChange }: Props) {
  const meetings = content.weeklyMeetings;

  const patchMeeting = (index: number, patch: Partial<WeeklyMeeting>) =>
    onChange({
      ...content,
      weeklyMeetings: meetings.map((item, position) =>
        position === index ? { ...item, ...patch } : item,
      ),
    });

  return (
    <AdminSection
      title="Agenda cotidiana (encontros fixos)"
      description="Cultos e encontros que se repetem toda semana. Cadastre apenas horários confirmados pela liderança — enquanto estiver vazio, o bloco não aparece no site."
    >
      {meetings.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border bg-background/60 p-5 text-sm leading-relaxed text-muted-foreground">
          Nenhum encontro fixo cadastrado. Não publicamos horários sem
          confirmação da igreja.
        </p>
      )}

      {meetings.map((meeting, index) => (
        <div
          key={meeting.id}
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
              onClick={() =>
                onChange({
                  ...content,
                  weeklyMeetings: meetings.filter(
                    (_, position) => position !== index,
                  ),
                })
              }
              className="rounded-full text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Remover
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`meeting-day-${meeting.id}`}
              label="Dia da semana"
              value={meeting.day}
              onChange={(value) => patchMeeting(index, { day: value })}
              placeholder="Domingo"
            />
            <TextField
              id={`meeting-time-${meeting.id}`}
              label="Horário"
              value={meeting.time}
              onChange={(value) => patchMeeting(index, { time: value })}
              placeholder="19h30"
            />
          </div>

          <TextField
            id={`meeting-title-${meeting.id}`}
            label="Nome do encontro"
            value={meeting.title}
            onChange={(value) => patchMeeting(index, { title: value })}
            placeholder="Culto de celebração"
          />

          <TextAreaField
            id={`meeting-note-${meeting.id}`}
            label="Observação"
            value={meeting.note}
            onChange={(value) => patchMeeting(index, { note: value })}
            placeholder="Local, público ou informação adicional"
            hint="Opcional. Deixe vazio para não exibir."
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          onChange({
            ...content,
            weeklyMeetings: [
              ...meetings,
              {
                id: createId("meeting"),
                day: "",
                time: "",
                title: "",
                note: "",
              },
            ],
          })
        }
        className="w-fit rounded-full border-border hover:bg-secondary"
      >
        <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Adicionar encontro fixo
      </Button>
    </AdminSection>
  );
}
