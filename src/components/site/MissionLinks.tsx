import { ArrowUpRight } from "lucide-react";

import { AdminNotice } from "@/components/site/AdminNotice";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/content/ContentProvider";
import { useAdminSession } from "@/hooks/use-admin-session";

/**
 * Botões externos do bloco de missão (Renovar Nações e Bíblia on-line).
 * Só aparecem quando a liderança informa a URL no painel.
 */
export function MissionLinks() {
  const { content } = useSiteContent();
  const { session } = useAdminSession();
  const { links } = content;

  const hasLinks = Boolean(links.nationsUrl || links.bibleUrl);

  if (!hasLinks) {
    if (session.status !== "authenticated") return null;

    return (
      <div className="mt-5">
        <AdminNotice
          title="Links de Renovar Nações e da Bíblia"
          where="Os botões externos aparecem aqui, abaixo do texto de missão."
          path="/admins → aba Sobre → Missão e links institucionais"
        />
      </div>
    );
  }

  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {links.nationsUrl && (
        <Button asChild className="h-11 rounded-full px-5">
          <a href={links.nationsUrl} target="_blank" rel="noopener noreferrer">
            {links.nationsLabel || "Renovar Nações"}
            <ArrowUpRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
          </a>
        </Button>
      )}

      {links.bibleUrl && (
        <Button
          asChild
          variant="outline"
          className="h-11 rounded-full border-border px-5 hover:bg-card"
        >
          <a href={links.bibleUrl} target="_blank" rel="noopener noreferrer">
            {links.bibleLabel || "Ler a Bíblia on-line"}
            <ArrowUpRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
          </a>
        </Button>
      )}
    </div>
  );
}
