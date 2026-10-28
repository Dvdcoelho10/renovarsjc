import { useState } from "react";
import { Database } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  clearLegacyContent,
  hasLegacyContent,
  readLegacyContent,
  useSiteContent,
} from "@/content/ContentProvider";

/**
 * Migração assistida do conteúdo que ficou salvo neste navegador pela versão
 * antiga (localStorage). Nada é enviado automaticamente e a cópia local só é
 * apagada depois que o servidor confirma a gravação.
 */
export function LegacyContentMigration() {
  const { save } = useSiteContent();
  const [available, setAvailable] = useState(() => hasLegacyContent());
  const [pending, setPending] = useState(false);

  if (!available) return null;

  const migrate = async () => {
    const legacy = readLegacyContent();

    if (!legacy) {
      clearLegacyContent();
      setAvailable(false);
      return;
    }

    setPending(true);
    const result = await save(legacy);
    setPending(false);

    if (!result.ok) {
      toast.error(
        result.error === "unauthorized"
          ? "Sua sessão expirou. Entre novamente no painel para enviar o conteúdo."
          : "Não foi possível enviar o conteúdo deste navegador para o servidor.",
      );
      return;
    }

    clearLegacyContent();
    setAvailable(false);
    toast.success("Conteúdo deste navegador publicado no servidor.");
  };

  return (
    <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/[0.06] p-4 sm:p-5">
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card text-accent-deep">
          <Database className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            Conteúdo antigo guardado neste navegador
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Encontramos uma cópia feita antes de o banco de dados entrar no ar.
            Ela não foi enviada sozinha para não sobrescrever o que já está
            publicado. Envie agora para aproveitar esse conteúdo — a cópia local
            só é apagada depois que o servidor confirmar a gravação.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={migrate}
              disabled={pending}
              className="h-9 rounded-full px-4"
            >
              {pending ? "Enviando..." : "Enviar para o servidor"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
