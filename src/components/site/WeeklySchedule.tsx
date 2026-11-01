import { Clock } from "lucide-react";

import { useSiteContent } from "@/content/ContentProvider";

/**
 * Agenda cotidiana: encontros fixos da semana. Só aparece quando a liderança
 * cadastra os horários confirmados no painel.
 */
export function WeeklySchedule() {
  const { content } = useSiteContent();
  const meetings = content.weeklyMeetings;

  if (meetings.length === 0) return null;

  return (
    <div className="mb-12">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
        Agenda da semana
      </p>
      <h2 className="mt-3 text-[1.6rem] leading-tight sm:text-2xl">
        Encontros fixos da igreja
      </h2>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {meetings.map((meeting) => (
          <li
            key={meeting.id}
            className="rounded-[1.5rem] border border-border/80 bg-card p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-deep">
                {meeting.day}
              </p>
              {meeting.time && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {meeting.time}
                </span>
              )}
            </div>

            <h3 className="mt-3 font-serif text-lg leading-snug text-foreground">
              {meeting.title}
            </h3>

            {meeting.note && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {meeting.note}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
