import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { getNavigation } from "@/content/site";
import { useSiteContent } from "@/content/ContentProvider";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { content } = useSiteContent();
  const navigation = getNavigation(content);
  const { church } = content;

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="container flex h-[4.75rem] items-center justify-between gap-6">
        <Link
          to="/"
          aria-label={`${church.name} — página inicial`}
          className="shrink-0 rounded-full transition-opacity hover:opacity-90"
        >
          <Logo />
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto lg:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors",
                  isActive
                    ? "font-medium text-primary"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-4 -bottom-0.5 h-[2px] rounded-full bg-accent" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            asChild
            className="hidden h-11 rounded-full px-6 text-sm shadow-[0_10px_24px_-14px_hsl(220_73%_31%_/_0.9)] sm:inline-flex"
          >
            <Link to="/contato">
              Fale com a igreja
              <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-full border border-border/70 bg-card text-foreground lg:hidden"
            aria-label="Abrir menu de navegação"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[86%] max-w-sm border-l-0 p-0">
          <div className="flex h-full flex-col">
            <div className="border-b border-border px-6 py-6">
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              <SheetDescription className="sr-only">
                Páginas disponíveis no site da igreja.
              </SheetDescription>
              <Logo />
            </div>

            <nav aria-label="Navegação principal (mobile)" className="flex-1 px-3 py-5">
              <ul className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center justify-between rounded-2xl px-4 py-3.5 text-[0.98rem] transition-colors",
                          isActive
                            ? "bg-secondary font-medium text-primary"
                            : "text-foreground/80 hover:bg-secondary/70",
                        )
                      }
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-accent/70"
                      />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-border bg-secondary/50 px-6 py-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {church.missionStatement}
              </p>
              <Button asChild className="mt-4 h-11 w-full rounded-full">
                <Link to="/contato" onClick={() => setOpen(false)}>
                  Fale com a igreja
                </Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
