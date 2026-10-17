import { cn } from "@/lib/utils";
import { church } from "@/content/site";

type LogoProps = {
  className?: string;
  /** "light" para fundos claros; "dark" adiciona um disco branco atrás do emblema. */
  variant?: "light" | "dark";
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: { mark: "h-10 w-10", title: "text-[15px]", sub: "text-[9px]" },
  md: { mark: "h-12 w-12", title: "text-base sm:text-[17px]", sub: "text-[10px]" },
  lg: { mark: "h-14 w-14", title: "text-lg", sub: "text-[10px]" },
};

export function Logo({
  className,
  variant = "light",
  showWordmark = true,
  size = "md",
}: LogoProps) {
  const s = sizes[size];

  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white",
          s.mark,
          variant === "light"
            ? "ring-1 ring-border"
            : "ring-2 ring-white/25 shadow-lg shadow-black/20",
        )}
      >
        <img
          src="/logo-adr.png"
          alt={
            showWordmark
              ? ""
              : `Emblema da ${church.shortName}`
          }
          className="h-full w-full object-contain"
          loading="eager"
          decoding="async"
        />
      </span>

      {showWordmark && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span
            className={cn(
              "font-serif font-semibold tracking-tight",
              s.title,
              variant === "dark" ? "text-primary-foreground" : "text-foreground",
            )}
          >
            {church.shortName}
          </span>
          <span
            className={cn(
              "mt-1 font-semibold uppercase tracking-[0.2em]",
              s.sub,
              variant === "dark" ? "text-primary-foreground/75" : "text-muted-foreground",
            )}
          >
            {church.acronym} · Desde 2013
          </span>
        </span>
      )}
    </span>
  );
}
