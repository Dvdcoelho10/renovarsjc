import { cn } from "@/lib/utils";
import { useSiteContent } from "@/content/ContentProvider";

/**
 * Composição gráfica discreta usada no destaque da página inicial.
 * Não simula templo, membros ou liderança: usa apenas arcos da identidade.
 */
export function EmblemPanel({
  className,
  imageUrl,
}: {
  className?: string;
  imageUrl?: string;
}) {
  const { content } = useSiteContent();
  const { church } = content;
  const logoSrc = church.logoUrl || "/logo-adr.png";

  if (imageUrl) {
    return (
      <div
        className={cn(
          "relative isolate overflow-hidden rounded-[2rem] bg-primary sm:rounded-[2.5rem]",
          "shadow-[0_40px_80px_-45px_hsl(220_73%_31%_/_0.65)]",
          className,
        )}
      >
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/5 bg-primary/35"
        />
        <div className="relative flex h-full items-end p-4 sm:p-5">
          <div className="flex items-center gap-3 rounded-2xl bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
            <img
              src={logoSrc}
              alt={`Emblema da ${church.shortName}`}
              className="h-10 w-10 object-contain"
            />
            <div className="leading-tight">
              <p className="font-serif text-sm font-semibold text-foreground">
                {church.acronym}
              </p>
              <p className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {church.city}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[2rem] bg-primary sm:rounded-[2.5rem]",
        "shadow-[0_40px_80px_-45px_hsl(220_73%_31%_/_0.65)]",
        className,
      )}
    >
      <svg
        viewBox="0 0 400 480"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <g
          fill="none"
          stroke="hsl(40 40% 98% / 0.14)"
          strokeWidth="1"
          strokeLinecap="round"
        >
          {[180, 240, 300, 360, 420, 480].map((r) => (
            <circle key={r} cx="20" cy="520" r={r} />
          ))}
        </g>
        <circle
          cx="20"
          cy="520"
          r="270"
          fill="none"
          stroke="hsl(26 85% 55% / 0.85)"
          strokeWidth="2.5"
          pathLength={100}
          strokeDasharray="16 84"
          strokeDashoffset="-52"
          strokeLinecap="round"
        />
        <g fill="hsl(40 40% 98% / 0.35)">
          <circle cx="330" cy="120" r="2" />
          <circle cx="300" cy="86" r="1.5" />
          <circle cx="360" cy="168" r="1.5" />
        </g>
      </svg>

      <div className="relative flex h-full flex-col items-center justify-center gap-8 px-8 py-14 sm:py-16">
        <div className="rounded-full bg-white p-2 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.55)] ring-1 ring-white/40 sm:p-3">
          <img
            src={logoSrc}
            alt={`Emblema da ${church.shortName}: pomba, chamas e pessoas`}
            className="h-36 w-36 object-contain sm:h-44 sm:w-44"
            decoding="async"
          />
        </div>

        <div className="text-center">
          <p className="font-serif text-lg text-primary-foreground sm:text-xl">
            {church.acronym}
          </p>
          <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary-foreground/60">
            {church.city} · {church.state}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Ilustração em linha: Bíblia aberta com a chama da identidade. */
export function BibleFlame({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 220"
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label="Ilustração de uma Bíblia aberta com uma chama"
    >
      <path
        d="M20 170c40 18 100 20 150 4"
        fill="none"
        stroke="hsl(220 73% 31% / 0.18)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M130 78c-22-16-54-21-84-16v96c30-5 62 0 84 16 22-16 54-21 84-16V62c-30-5-62 0-84 16z"
        fill="hsl(40 38% 97%)"
        stroke="hsl(220 73% 31% / 0.55)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M130 78v96"
        stroke="hsl(220 73% 31% / 0.55)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <g stroke="hsl(220 73% 31% / 0.25)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M64 92c18-2 34 0 50 6" />
        <path d="M64 110c18-2 34 0 50 6" />
        <path d="M64 128c18-2 34 0 50 6" />
        <path d="M146 98c16-6 32-8 50-6" />
        <path d="M146 116c16-6 32-8 50-6" />
      </g>
      <path
        d="M130 24c10 13 18 22 18 33a18 18 0 0 1-36 0c0-9 5-15 12-22 1 8 4 10 6 12 2-8 0-16 0-23z"
        fill="hsl(26 85% 51% / 0.14)"
        stroke="hsl(26 85% 45%)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Ilustração para estados sem conteúdo publicado. */
export function EmptyStateGraphic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 170"
      className={cn("h-auto w-full", className)}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="22"
        y="44"
        width="106"
        height="92"
        rx="18"
        fill="hsl(40 38% 97%)"
        stroke="hsl(220 73% 31% / 0.35)"
        strokeWidth="1.8"
      />
      <path d="M22 70h106" stroke="hsl(220 73% 31% / 0.25)" strokeWidth="1.8" />
      <g stroke="hsl(220 73% 31% / 0.5)" strokeWidth="2.5" strokeLinecap="round">
        <path d="M52 34v14" />
        <path d="M98 34v14" />
      </g>
      <g fill="hsl(220 73% 31% / 0.2)">
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={40 + col * 24}
              y={84 + row * 17}
              width="14"
              height="7"
              rx="3.5"
            />
          )),
        )}
      </g>
      <rect
        x="126"
        y="82"
        width="92"
        height="64"
        rx="16"
        fill="hsl(40 38% 97%)"
        stroke="hsl(220 73% 31% / 0.35)"
        strokeWidth="1.8"
      />
      <circle
        cx="172"
        cy="114"
        r="15"
        fill="none"
        stroke="hsl(220 73% 31% / 0.5)"
        strokeWidth="1.8"
      />
      <path d="M169 108l10 6-10 6z" fill="hsl(220 73% 31% / 0.55)" />
      <circle cx="204" cy="46" r="6" fill="hsl(26 85% 51% / 0.75)" />
    </svg>
  );
}
