import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, PencilLine, RotateCcw, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import {
  PageEditorFields,
  type EditablePage,
} from "@/components/editor/PageEditorFields";
import { CustomPageFields } from "@/components/admin/CustomPageFields";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { normalizeContent, useSiteContent } from "@/content/ContentProvider";
import type { CustomPage, SiteContent } from "@/content/site";
import { endAdminSession, hasEditorHint } from "@/lib/admin-auth";

const pageByPath: Record<string, EditablePage> = {
  "/": "home",
  "/sobre": "about",
  "/agenda": "agenda",
  "/mensagens": "messages",
  "/contato": "contact",
};

const pageLabels: Record<EditablePage, string> = {
  home: "Início",
  about: "Sobre a igreja",
  agenda: "Cultos e agenda",
  messages: "Mensagens",
  contact: "Contato",
};

export function PageEditor() {
  const { pathname } = useLocation();
  const { content, save } = useSiteContent();
  const [isAdmin, setIsAdmin] = useState(() => hasEditorHint());
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<SiteContent>(content);

  useEffect(() => {
    const syncSession = () => {
      const active = hasEditorHint();
      setIsAdmin(active);
      if (!active) setOpen(false);
    };

    window.addEventListener("focus", syncSession);
    window.addEventListener("storage", syncSession);
    document.addEventListener("visibilitychange", syncSession);

    return () => {
      window.removeEventListener("focus", syncSession);
      window.removeEventListener("storage", syncSession);
      document.removeEventListener("visibilitychange", syncSession);
    };
  }, []);

  if (!isAdmin) return null;

  const path = pathname.replace(/\/+$/, "") || "/";
  const standardPage = pageByPath[path];

  const customSlug = /^\/pagina\/(.+)$/.exec(path)?.[1];
  const customPage = customSlug
    ? content.customPages.find(
        (item) => item.slug === decodeURIComponent(customSlug),
      )
    : undefined;

  if (!standardPage && !customPage) return null;

  const pageLabel = standardPage
    ? pageLabels[standardPage]
    : customPage!.menuLabel || customPage!.title;

  const openEditor = () => {
    setDraft(normalizeContent(content));
    setOpen(true);
  };

  const updateCustomPage = (next: CustomPage) =>
    setDraft((current) => ({
      ...current,
      customPages: current.customPages.map((item) =>
        item.id === next.id ? next : item,
      ),
    }));

  const handleExit = () => {
    endAdminSession();
    setOpen(false);
    setIsAdmin(false);
    toast.success("Modo administrador encerrado.");
  };

  const handleSave = () => {
    if (draft.events.some((event) => !event.title.trim() || !event.date)) {
      toast.error("Preencha título e data de todos os encontros antes de salvar.");
      return;
    }
    if (draft.messages.some((message) => !message.title.trim())) {
      toast.error("Preencha o título de todas as mensagens antes de salvar.");
      return;
    }
    if (draft.highlights.some((highlight) => !highlight.title.trim())) {
      toast.error("Preencha o título de todos os destaques antes de salvar.");
      return;
    }

    const stored = save(normalizeContent(draft));
    if (!stored) {
      toast.error(
        "Não foi possível salvar. O armazenamento deste navegador pode estar cheio — reduza o tamanho das imagens.",
      );
      return;
    }

    toast.success(`Página “${pageLabel}” atualizada.`);
    setOpen(false);
  };

  return (
    <>
      <div className="fixed inset-x-3 bottom-3 z-40 mx-auto flex w-fit max-w-full items-center gap-1.5 rounded-full border border-primary-foreground/15 bg-primary px-2.5 py-2 text-primary-foreground shadow-[0_22px_50px_-20px_rgba(0,0,0,0.7)] sm:inset-x-auto sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:gap-2.5 sm:px-3.5">
        <span className="hidden items-center gap-2 pl-1 pr-1 text-xs font-medium sm:flex">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Modo administrador · {pageLabel}
        </span>

        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={openEditor}
          className="h-8 rounded-full px-3 text-xs font-semibold"
        >
          <PencilLine className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Editar página
        </Button>

        <Link
          to="/admins"
          className="rounded-full px-2.5 py-1.5 text-xs font-medium text-primary-foreground/90 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          Painel
        </Link>

        <Link
          to="/admins?tab=paginas"
          className="rounded-full px-2.5 py-1.5 text-xs font-medium text-primary-foreground/90 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          Páginas
        </Link>

        <button
          type="button"
          onClick={handleExit}
          aria-label="Sair do modo administrador"
          title="Sair do modo administrador"
          className="flex h-8 w-8 items-center justify-center rounded-full text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-2xl"
        >
          <SheetHeader className="pr-8 text-left">
            <SheetTitle className="text-2xl">
              Editar página — {pageLabel}
            </SheetTitle>
            <SheetDescription className="leading-relaxed">
              Altere textos, imagens e links desta página. As mudanças aparecem
              no site ao salvar e ficam guardadas neste navegador.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-5">
            {standardPage ? (
              <PageEditorFields
                page={standardPage}
                draft={draft}
                onChange={setDraft}
              />
            ) : (
              <CustomPageFields
                page={
                  draft.customPages.find((item) => item.id === customPage!.id) ??
                  customPage!
                }
                onChange={updateCustomPage}
              />
            )}
          </div>

          <div className="sticky bottom-0 z-10 -mx-6 -mb-6 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDraft(normalizeContent(content))}
              className="rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Desfazer alterações
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-10 rounded-full border-border hover:bg-secondary"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="h-10 rounded-full px-5"
              >
                <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                Salvar página
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
