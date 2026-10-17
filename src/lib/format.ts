import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function safeDate(iso: string) {
  if (!iso) return null;
  const date = parseISO(iso);
  return isValid(date) ? date : null;
}

export function formatLongDate(iso: string) {
  const date = safeDate(iso);
  if (!date) return "";
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatShortDate(iso: string) {
  const date = safeDate(iso);
  if (!date) return "Data a definir";
  return format(date, "d MMM yyyy", { locale: ptBR });
}

export function formatMonthYear(iso: string) {
  const date = safeDate(iso);
  if (!date) return "";
  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
}

export function eventDayMonth(iso: string) {
  const date = safeDate(iso);
  if (!date) {
    return { day: "--", month: "", weekday: "" };
  }

  return {
    day: format(date, "dd"),
    month: format(date, "MMM", { locale: ptBR }).replace(".", "").toUpperCase(),
    weekday: format(date, "EEEE", { locale: ptBR }),
  };
}

/** Link de ligação a partir do telefone informado. */
export function phoneHref(value: string) {
  return `tel:+${value.replace(/\D/g, "")}`;
}

export function whatsappHref(value: string) {
  return `https://wa.me/${value.replace(/\D/g, "")}`;
}
