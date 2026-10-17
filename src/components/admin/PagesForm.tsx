import { Link } from "react-router-dom";
import { ExternalLink, FilePlus2, Trash2 } from "lucide-react";

import { CustomPageFields, newSectionId } from "@/components/admin/CustomPageFields";
import { AdminSection } from "@/components/admin/fields";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { customPagePath, type CustomPage, type SiteContent } from "@/content/site";

type Props = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
  /** Aplica a criação ou a exclusão imediatamente no site. */
  onCommit?: (next: SiteContent) => void;
};

export function PagesForm({ content, onChange, onCommit }: Props) {
  const commit = (next: SiteContent) => {
    if (onCommit) onCommit(next);
    else onChange(next);
  };

  const createPage = () => {
    const usedSlugs = new Set(content.customPages.map((page) => page.slug));
    let slug = "nova-pagina";
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `nova-pagina-${suffix}`;
      suffix += 1;
    }

    const page: CustomPage = {
      id: `page-${Date.now().toString(36)}`,
      slug,
      menuLabel: "Nova página",
      title: "Nova página",
      eyebrow: "",
      description: "",
      imageUrl: "",
      sections: [{ id: newSectionId(), heading: "", body: "" }],
    };

    commit({ ...content, customPages: [...content.customPages, page] });
  };

  const updatePage = (next: CustomPage) =>
    onChange({
      ...content,
      customPages: content.customPages.map((page) =>
        page.id === next.id ? next : page,
      ),
    });

  const removePage = (id: string) =>
    commit({
      ...content,
      customPages: content.customPages.filter((page) => page.id !== id),
    });

  return (
    <div className="grid gap-5">
      <AdminSection
        title="Páginas do menu"
        description="Crie páginas novas para o cabeçalho do site. Cada página tem textos e foto próprios, pode ser editada aqui ou na própria página, e aparece no menu do cabeçalho e do rodapé."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={createPage}
            className="h-11 rounded-full px-5"
          >
            <FilePlus2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Criar nova página
          </Button>
          <span className="text-xs text-muted-foreground">
            {content.customPages.length === 0
              ? "Nenhuma página criada além das fixas do site."
              : `${content.customPages.length} página${
                  content.customPages.length > 1 ? "s" : ""
                } criada${content.customPages.length > 1 ? "s" : ""}.`}
          </span>
        </div>
        <p className="rounded-xl border border-border/70 bg-secondary/40 p-3 text-xs leading-relaxed text-muted-foreground">
          Criar e excluir aplica na hora: a página entra ou sai do menu e o
          endereço passa a existir ou deixa de existir. Já os textos e a foto são
          gravados com o botão “Salvar alterações”.
        </p>
      </AdminSection>

      {content.customPages.map((page, index) => (
        <div key={page.id} className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/80 bg-card px-5 py-4">
            <div className="min-w-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-accent-deep">
                Página {index + 1}
              </p>
              <h2 className="mt-1 truncate text-lg">
                {page.menuLabel || page.title || "Sem nome"}
              </h2>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {customPagePath(page.slug)}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full border-border hover:bg-secondary"
              >
                <Link to={customPagePath(page.slug)}>
                  <ExternalLink className="h-4 w-4 sm:mr-1.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Abrir</span>
                </Link>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Excluir a página ${page.menuLabel || page.title}`}
                  >
                    <Trash2 className="h-4 w-4 sm:mr-1.5" aria-hidden="true" />
                    <span className="hidden sm:inline">Excluir</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir esta página?</AlertDialogTitle>
                    <AlertDialogDescription>
                      “{page.menuLabel || page.title}” sai do menu do site e o
                      endereço {customPagePath(page.slug)} deixa de existir. Os
                      textos desta página serão perdidos. Esta ação não pode ser
                      desfeita depois de salvar.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => removePage(page.id)}
                      className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir página
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <CustomPageFields page={page} onChange={updatePage} />
        </div>
      ))}
    </div>
  );
}
