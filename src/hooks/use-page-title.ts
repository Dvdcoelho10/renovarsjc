import { useEffect } from "react";

import { useSiteContent } from "@/content/ContentProvider";

export function usePageTitle(title?: string) {
  const { content } = useSiteContent();
  const { church } = content;

  useEffect(() => {
    document.title = title
      ? `${title} — ${church.shortName} (${church.acronym})`
      : `${church.shortName} — ${church.acronym} | ${church.city}`;
  }, [title, church.shortName, church.acronym, church.city]);
}
