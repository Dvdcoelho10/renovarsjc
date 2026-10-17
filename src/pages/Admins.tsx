import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  ExternalLink,
  Info,
  LogOut,
  RotateCcw,
  Save,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { ContactForm } from "@/components/admin/ContactForm";
import { EventsForm } from "@/components/admin/EventsForm";
import { GeneralForm } from "@/components/admin/GeneralForm";
import { HighlightsForm } from "@/components/admin/HighlightsForm";
import { ImagesForm } from "@/components/admin/ImagesForm";
import { MessagesForm } from "@/components/admin/MessagesForm";
import { YoutubeForm } from "@/components/admin/YoutubeForm";
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
  defaultContent,
  getYoutubeChannelId,
  type SiteContent,
} from "@/content/site";
import { endAdminSession, hasAdminSession } from "@/lib/admin-auth";
import { usePageTitle } from "@/hooks/use-page-title";

const tabLabels = {
  geral: "Conteúdo geral",
  imagens: "Imagens",
  youtube: "YouTube",
  contato: "Contato",
  destaques: "Destaques",
  agenda: "Agenda",
  mensagens: "Mensagens",
} as const;

type TabValue = keyof typeof tabLabels;

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { content, save, reset } = useSiteContent();
  const [draft, setDraft] = useState<SiteContent>(() =>
    normalizeContent(content),
  );
  const [tab, setTab] = useState<TabValue>("geral");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(content);

  const handleSave = () => {
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
      setTab("destaques");
      toast.error("Preencha o título de todos os destaques antes de salvar.");
      return;
    }

    const youtubeReady =
      Boolean(getYoutubeChannelId(draft.youtube.channel)) &&
      Boolean(draft.youtube.apiKey.trim());

    if (draft.youtube.enabled && !youtubeReady) {
      setTab("youtube");
      toast.error(
        "Para exibir o último vídeo, informe o ID do canal (UC...) e a chave da API do YouTube.",
      );
      return;
    }

    const normalized = normalizeContent(draft);
    const stored = save(normalized);
    setDraft(normalized);

    if (stored) {
      toast.success("Conteúdo salvo neste navegador.");
    } else {
      toast.error(
        "O navegador não tem espaço para salvar. Remova algumas imagens e tente novamente.",
      );
    }
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

  const handleRestoreDefaults = () => {
    reset();
    setDraft(normalizeContent(defaultContent));
    toast.success("Conteúdo padrão restaurado.");
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
        <div className="max-w-2xl">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
            Administração do site
          </p>
          <h1 className="mt-3 text-[1.9rem] leading-tight sm:text-4xl">
            Editar conteúdo
          </h1>
          <p className="mt-3 text-[0.98rem] leading-relaxed text-muted-foreground">
            Altere textos, imagens e links das páginas, dos destaques, da agenda
            e das mensagens. O menu do site se ajusta automaticamente.
          </p>
        </div>

        <div className="mt-6 flex gap-3 rounded-2xl border border-accent/25 bg-accent/[0.06] p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent-deep" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            As alterações ficam salvas neste navegador até que o banco de dados
            seja conectado. Use <strong className="font-medium text-foreground">Exportar</strong>{" "}
            para guardar uma cópia do conteúdo.
          </p>
        </div>

        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as TabValue)}
          className="mt-8"
        >
          <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-full border border-border bg-card p-1.5">
            {(Object.keys(tabLabels) as TabValue[]).map((value) => (
              <TabsTrigger
                key={value}
                value={value}
                className="shrink-0 rounded-full px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
              >
                {tabLabels[value]}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-5">
            <TabsContent value="geral" className="mt-0">
              <GeneralForm content={draft} onChange={setDraft} />
            </TabsContent>
            <TabsContent value="imagens" className="mt-0">
              <ImagesForm content={draft} onChange={setDraft} />
            </TabsContent>
            <TabsContent value="youtube" className="mt-0">
              <YoutubeForm content={draft} onChange={setDraft} />
            </TabsContent>
            <TabsContent value="contato" className="mt-0">
              <ContactForm content={draft} onChange={setDraft} />
            </TabsContent>
            <TabsContent value="destaques" className="mt-0">
              <HighlightsForm content={draft} onChange={setDraft} />
            </TabsContent>
            <TabsContent value="agenda" className="mt-0">
              <EventsForm content={draft} onChange={setDraft} />
            </TabsContent>
            <TabsContent value="mensagens" className="mt-0">
              <MessagesForm content={draft} onChange={setDraft} />
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
              {dirty ? "Alterações não salvas" : "Tudo salvo neste navegador"}
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
                disabled={!dirty}
                className="h-11 flex-1 rounded-full sm:flex-none"
              >
                <Save className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Salvar alterações
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
  const [authenticated, setAuthenticated] = useState(() => hasAdminSession());

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <AdminDashboard
      onLogout={() => {
        endAdminSession();
        setAuthenticated(false);
      }}
    />
  );
};

export default Admins;
