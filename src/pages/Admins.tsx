import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Download,
  ExternalLink,
  FilePlus2,
  Info,
  LogOut,
  RotateCcw,
  Save,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { IdentityForm } from "@/components/admin/IdentityForm";
import { LegacyContentMigration } from "@/components/admin/LegacyContentMigration";
import { PagesForm } from "@/components/admin/PagesForm";
import { YoutubeForm } from "@/components/admin/YoutubeForm";
import { PageEditorFields } from "@/components/editor/PageEditorFields";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { normalizeContent, useSiteContent } from "@/content/ContentProvider";
import {
  customPagePath,
  defaultContent,
  type SiteContent,
} from "@/content/site";
import { logoutAdmin } from "@/lib/admin-session";
import { useAdminSession } from "@/hooks/use-admin-session";
import { usePageTitle } from "@/hooks/use-page-title";

const tabLabels = {
  inicio: "Início",
  sobre: "Sobre",
  agenda: "Agenda",
  mensagens: "Mensagens",
  contato: "Contato",
  paginas: "Páginas",
  identidade: "Identidade",
  youtube: "YouTube",
} as const;

const sitePages: { label: string; to: string }[] = [
  { label: "Início", to: "/" },
  { label: "Sobre", to: "/sobre" },
  { label: "Agenda", to: "/agenda" },
  { label: "Mensagens", to: "/mensagens" },
  { label: "Contato", to: "/contato" },
];

type TabValue = keyof typeof tabLabels;

const saveErrorMessages: Record<string, string> = {
  unauthorized:
    "Sua sessão expirou. Entre novamente no painel para publicar as alterações.",
  db_not_configured:
    "O servidor está sem banco de dados configurado. Nada foi publicado.",
  invalid_content: "O conteúdo ficou inválido. Recarregue a página e tente novamente.",
  payload_too_large:
    "O conteúdo ficou grande demais (imagens antigas no formato data URL). Envie as fotos novamente.",
  network_error: "Sem conexão com o servidor. Tente novamente.",
};

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { content, save, reset, dbConfigured } = useSiteContent();
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<SiteContent>(() =>
    normalizeContent(content),
  );
  const [tab, setTab] = useState<TabValue>(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    return requested && requested in tabLabels
      ? (requested as TabValue)
      : "inicio";
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousContent = useRef(content);

  // O conteúdo chega do servidor depois da montagem. Se o rascunho ainda for
  // igual ao conteúdo anterior (ninguém editou), ele acompanha a versão nova;
  // assim o painel nunca salva por cima com o conteúdo padrão.
  useEffect(() => {
    const previous = previousContent.current;
    previousContent.current = content;
    setDraft((current) =>
      JSON.stringify(current) === JSON.stringify(previous)
        ? normalizeContent(content)
        : current,
    );
  }, [content]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(content);

  const openPages = [
    ...sitePages,
    ...draft.customPages.map((page) => ({
      label: page.menuLabel || page.title,
      to: customPagePath(page.slug),
    })),
  ];

  const handleSave = async () => {
    if (draft.events.some((event) => !event.title.trim() || !event.date)) {
      setTab("agenda");
      toast.error("Preencha título e data de todos os encontros antes de salvar.");
      return;
    }
    if (draft.messages.some((message) => !message.title.trim())) {
      setTab("mensagens");
      toast.error("Preencha o título de todas as mensagens antes de salvar.");
      return;
    }
    if (draft.highlights.some((highlight) => !highlight.title.trim())) {
      setTab("inicio");
      toast.error("Preencha o título de todos os destaques antes de salvar.");
      return;
    }

    const normalized = normalizeContent(draft);
    setSaving(true);
    const result = await save(normalized);
    setSaving(false);

    if (!result.ok) {
      toast.error(saveErrorMessages[result.error ?? ""] ?? "Não foi possível publicar agora.");
      return;
    }

    setDraft(normalized);
    toast.success("Conteúdo publicado. As alterações já aparecem no site.");
  };

  /** Publica imediatamente uma mudança estrutural (criar/excluir página). */
  const commitContent = async (next: SiteContent) => {
    const normalized = normalizeContent(next);
    const result = await save(normalized);

    if (!result.ok) {
      toast.error(saveErrorMessages[result.error ?? ""] ?? "Não foi possível publicar agora.");
      return;
    }

    setDraft(normalized);
    toast.success("Menu do site atualizado.");
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "conteudo-adr.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      setDraft(normalizeContent(parsed));
      toast.success("Conteúdo importado. Clique em salvar para aplicar.");
    } catch {
      toast.error("Não foi possível ler este arquivo.");
    }
  };

  const handleRestoreDefaults = async () => {
    const result = await reset();
    if (!result.ok) {
      toast.error(saveErrorMessages[result.error ?? ""] ?? "Não foi possível restaurar agora.");
      return;
    }
    setDraft(normalizeContent(defaultContent));
    toast.success("Conteúdo padrão publicado no site.");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="container flex h-[4.5rem] items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="sm:hidden">
              <Logo size="sm" showWordmark={false} />
            </span>
            <span className="hidden sm:block">
              <Logo size="sm" />
            </span>
            <span className="hidden rounded-full bg-secondary px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary lg:inline">
              Painel
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Link to="/">
                <ExternalLink className="h-4 w-4 sm:mr-1.5" aria-hidden="true" />
                <span className="hidden sm:inline">Ver site</span>
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="rounded-full border-border hover:bg-secondary"
              aria-label="Exportar conteúdo em JSON"
            >
              <Download className="h-4 w-4 sm:mr-1.5" aria-hidden="true" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border-border hover:bg-secondary"
              aria-label="Importar conteúdo em JSON"
            >
              <Upload className="h-4 w-4 sm:mr-1.5" aria-hidden="true" />
              <span className="hidden sm:inline">Importar</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4 sm:mr-1.5" aria-hidden="true" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleImportFile(file);
                event.target.value = "";
              }}
            />
          </div>
        </div>
      </header>

      <main className="container max-w-5xl py-8 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
              Administração do site
            </p>
            <h1 className="mt-3 text-[1.9rem] leading-tight sm:text-4xl">
              Editar conteúdo
            </h1>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-muted-foreground">
              Altere textos, imagens e links das páginas, dos destaques, da
              agenda e das mensagens. O menu do site se ajusta automaticamente.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => {
              setTab("paginas");
              document
                .getElementById("painel-abas")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="h-11 rounded-full px-5"
          >
            <FilePlus2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Criar ou excluir páginas
          </Button>
        </div>

        <div className="mt-6 flex gap-3 rounded-2xl border border-accent/25 bg-accent/[0.06] p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent-deep" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            As alterações são gravadas no banco de dados e passam a valer para
            todos os visitantes assim que você salva. Use{" "}
            <strong className="font-medium text-foreground">Exportar</strong> para
            guardar uma cópia do conteúdo.
          </p>
        </div>

        {!dbConfigured && (
          <div className="mt-3 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/[0.06] p-4">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              O servidor não encontrou o banco de dados (<code>DB_*</code>).
              Nada será publicado até a conexão ser configurada no{" "}
              <code>.env</code> ou nas variáveis da Hostinger.
            </p>
          </div>
        )}

        <LegacyContentMigration />

        <div className="mt-5 rounded-2xl border border-border/80 bg-card p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Abrir página no site
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Abra a página e use a barra “Modo administrador” na parte de baixo
            para editar vendo o resultado no lugar.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {openPages.map((page) => (
              <Link
                key={page.to}
                to={page.to}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-secondary"
              >
                {page.label}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>

        <Tabs
          id="painel-abas"
          value={tab}
          onValueChange={(value) => setTab(value as TabValue)}
          className="mt-8 scroll-mt-24"
        >
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-2xl border border-border bg-card p-1.5 sm:rounded-full">
            {(Object.keys(tabLabels) as TabValue[]).map((value) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-full px-3.5 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
              >
                {tabLabels[value]}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-5">
            <TabsContent value="inicio" className="mt-0">
              <PageEditorFields page="home" draft={draft} onChange={setDraft} />
            </TabsContent>
            <TabsContent value="sobre" className="mt-0">
              <PageEditorFields page="about" draft={draft} onChange={setDraft} />
            </TabsContent>
            <TabsContent value="agenda" className="mt-0">
              <PageEditorFields page="agenda" draft={draft} onChange={setDraft} />
            </TabsContent>
            <TabsContent value="mensagens" className="mt-0">
              <PageEditorFields
                page="messages"
                draft={draft}
                onChange={setDraft}
              />
            </TabsContent>
            <TabsContent value="contato" className="mt-0">
              <PageEditorFields page="contact" draft={draft} onChange={setDraft} />
            </TabsContent>
            <TabsContent value="paginas" className="mt-0">
              <PagesForm
                content={draft}
                onChange={setDraft}
                onCommit={commitContent}
              />
            </TabsContent>
            <TabsContent value="identidade" className="mt-0">
              <IdentityForm content={draft} onChange={setDraft} />
            </TabsContent>
            <TabsContent value="youtube" className="mt-0">
              <YoutubeForm content={draft} onChange={setDraft} />
            </TabsContent>
          </div>
        </Tabs>

        <div className="mt-8 flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Restaurar conteúdo padrão
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Restaurar conteúdo padrão?</AlertDialogTitle>
                <AlertDialogDescription>
                  Todas as alterações salvas neste navegador serão removidas e o
                  site volta ao conteúdo original. Esta ação não pode ser
                  desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRestoreDefaults}
                  className="rounded-full"
                >
                  Restaurar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="sticky bottom-4 z-20 mt-6 pb-2">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-[0_20px_40px_-24px_rgba(19,37,74,0.45)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <p className="px-2 text-sm text-muted-foreground">
              {dirty ? "Alterações não publicadas" : "Tudo publicado no site"}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!dirty}
                onClick={() => setDraft(normalizeContent(content))}
                className="h-11 flex-1 rounded-full border-border sm:flex-none"
              >
                Descartar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={!dirty || saving}
                className="h-11 flex-1 rounded-full sm:flex-none"
              >
                <Save className="mr-1.5 h-4 w-4" aria-hidden="true" />
                {saving ? "Publicando..." : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const Admins = () => {
  usePageTitle("Painel administrativo");
  const { session, refresh } = useAdminSession();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);

  if (session.status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary px-4">
        <p className="rounded-full bg-card px-5 py-3 text-sm font-medium text-foreground shadow-lg">
          Verificando acesso…
        </p>
      </div>
    );
  }

  if (session.status !== "authenticated") {
    return <AdminLogin onSuccess={() => void refresh(true)} />;
  }

  return (
    <AdminDashboard
      onLogout={() => {
        void logoutAdmin().then(() => refresh(true));
      }}
    />
  );
};

export default Admins;
