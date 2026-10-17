import { useEffect } from "react";
import { church } from "@/content/site";

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title
      ? `${title} — ${church.shortName} (${church.acronym})`
      : `${church.shortName} — ${church.acronym} | ${church.city}`;
  }, [title]);
}
