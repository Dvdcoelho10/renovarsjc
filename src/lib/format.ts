import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatLongDate(iso: string) {
  return format(parseISO(iso), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatShortDate(iso: string) {
  return format(parseISO(iso), "d MMM yyyy", { locale: ptBR });
}

export function formatMonthYear(iso: string) {
  return format(parseISO(iso), "MMMM 'de' yyyy", { locale: ptBR });
}

export function eventDayMonth(iso: string) {
  const date = parseISO(iso);
  return {
    day: format(date, "dd"),
    month: format(date, "MMM", { locale: ptBR }).replace(".", "").toUpperCase(),
    weekday: format(date, "EEEE", { locale: ptBR }),
  };
}

/** Texto curto de endereço para links de contato (sem publicar dados fictícios). */
export function phoneHref(value: string) {
  return `tel:+${value.replace(/\D/g, "")}`;
}

export function whatsappHref(value: string) {
  return `https://wa.me/${value.replace(/\D/g, "")}`;
}
