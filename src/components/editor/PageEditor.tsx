import { useState } from "react";
import { useLocation } from "react-router-dom";
import { PencilLine, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import {
  PageEditorFields,
  type EditablePage,
} from "@/components/editor/PageEditorFields";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { normalizeContent, useSiteContent } from "@/content/ContentProvider";
import type { SiteContent } from "@/content/site";
import { hasEditorHint } from "@/lib/admin-auth";

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
  const [isAdmin] = useState(() => hasEditorHint());
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<SiteContent>(content);

  if (!isAdmin) return null;

  const path = pathname.replace(/\/+$/, "") || "/";
  const page = pageByPath[path];
  if (!page) return null;

  const openEditor = () => {
    setDraft(normalizeContent(content));
    setOpen(true);
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

    toast.success(`Página “${pageLabels[page]}” atualizada.`);
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        onClick={openEditor}
        className="fixed bottom-5 right-4 z-40 h-11 rounded-full px-5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)] sm:bottom-6 sm:right-6"
      >
        <PencilLine className="mr-2 h-4 w-4" aria-hidden="true" />
        Editar esta página
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-2xl"
        >
          <SheetHeader className="pr-8 text-left">
            <SheetTitle className="text-2xl">
              Editar página — {pageLabels[page]}
            </SheetTitle>
            <SheetDescription className="leading-relaxed">
              Altere textos, imagens e links desta página. As mudanças aparecem
              no site ao salvar e ficam guardadas neste navegador.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-5">
            <PageEditorFields page={page} draft={draft} onChange={setDraft} />
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
