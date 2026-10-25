import { useState } from "react";
import { Check, Copy, HandCoins } from "lucide-react";

import type { GivingCopy } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Bloco de dízimos e ofertas. Mostra o QR Code Pix da igreja com o CNPJ
 * na tarja abaixo, além de um atalho para copiar a chave.
 */
export function GivingCard({
  giving,
  className,
}: {
  giving: GivingCopy;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyCnpj = async () => {
    try {
      await navigator.clipboard.writeText(giving.cnpj);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-[1.6rem] border border-border/80 bg-background",
        className,
      )}
    >
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent-deep">
            <HandCoins className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-serif text-[1.15rem] leading-tight text-foreground">
              {giving.title}
            </h2>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Pix · QR Code
            </p>
          </div>
        </div>

        <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">
          {giving.description}
        </p>
      </div>

      <div className="px-5 pt-4 sm:px-6">
        <div className="rounded-2xl border border-border/70 bg-white p-3">
          <img
            src={giving.qrImageUrl}
            alt={`QR Code Pix de ${giving.legalName} para ${giving.title.toLowerCase()}`}
            className="mx-auto aspect-square w-full max-w-[15rem] object-contain"
            loading="lazy"
          />
        </div>
      </div>

      <div className="mt-4 bg-primary px-5 py-3 text-center">
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground/75">
          {giving.legalName}
        </p>
        <p className="mt-0.5 text-[0.8rem] font-semibold tracking-wide text-primary-foreground">
          CNPJ {giving.cnpj}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={copyCnpj}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[0.8rem] font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-secondary"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {copied ? "CNPJ copiado" : "Copiar CNPJ da igreja"}
        </button>

        <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
          {giving.note}
        </p>
      </div>
    </article>
  );
}
