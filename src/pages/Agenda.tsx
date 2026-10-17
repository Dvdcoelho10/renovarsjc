import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Clock } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { EmptyStateGraphic } from "@/components/brand/Graphics";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/content/ContentProvider";
import { eventDayMonth, formatLongDate } from "@/lib/format";
import { usePageTitle } from "@/hooks/use-page-title";

const Agenda = () => {
  usePageTitle("Cultos e agenda");
  const { content } = useSiteContent();
  const sortedEvents = [...content.events].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return (
    <>
      <PageHeader
        eyebrow="Cultos e agenda"
        title="Nossos encontros e a programação da igreja"
        description="Horários de cultos, encontros e eventos serão publicados nesta página pela liderança, com data, horário e local confirmados."
        imageUrl={content.images.agendaHero}
      />

      <section className="container py-16 sm:py-20">
        {sortedEvents.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/80 bg-card px-6 py-12 text-center sm:px-10">
            <EmptyStateGraphic className="mx-auto max-w-[15rem]" />
            <h2 className="mt-8 text-[1.5rem] leading-snug sm:text-2xl">
              A programação ainda não foi publicada
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[0.98rem] leading-relaxed text-muted-foreground">
              Assim que a liderança confirmar os horários de cultos e encontros,
              eles serão divulgados aqui. Não publicamos datas ou horários sem
              confirmação da igreja.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-full px-6">
                <Link to="/sobre">
                  Conheça a igreja
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-border px-6 hover:bg-secondary"
              >
                <Link to="/contato">Falar com a igreja</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ul className="space-y-5">
              {sortedEvents.map((event) => {
                const { day, month, weekday } = eventDayMonth(event.date);

                return (
                  <li key={event.id}>
                    <article className="grid gap-6 rounded-[1.75rem] border border-border/80 bg-card p-5 sm:grid-cols-[auto_1fr] sm:p-7">
                      <div className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-secondary">
                        <span className="font-serif text-3xl leading-none text-primary">
                          {day}
                        </span>
                        <span className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {month}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-deep">
                          {weekday}, {formatLongDate(event.date)}
                        </p>
                        <h2 className="mt-2 text-xl sm:text-2xl">{event.title}</h2>
                        {event.description && (
                          <p className="mt-2 text-[0.97rem] leading-relaxed text-muted-foreground">
                            {event.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          {event.time && (
                            <span className="inline-flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary/70" aria-hidden="true" />
                              {event.time}
                            </span>
                          )}
                          {event.location && (
                            <span className="inline-flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary/70" aria-hidden="true" />
                              {event.location}
                            </span>
                          )}
                        </div>

                        {event.imageUrl && (
                          <img
                            src={event.imageUrl}
                            alt=""
                            className="mt-5 aspect-[16/9] w-full rounded-2xl object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>

            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              A programação é publicada pela liderança da igreja. Em caso de
              dúvidas sobre um encontro, utilize os canais de contato disponíveis.
            </p>
          </>
        )}
      </section>
    </>
  );
};

export default Agenda;
