import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, type LucideIcon } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { getNavigation } from "@/content/site";
import { useSiteContent } from "@/content/ContentProvider";

type SocialLink = { label: string; url: string; icon: LucideIcon };

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { content } = useSiteContent();
  const navigation = getNavigation(content);
  const { church, home } = content;

  const socials: SocialLink[] = [
    { label: "Instagram", url: content.contact.social.instagram, icon: Instagram },
    { label: "Facebook", url: content.contact.social.facebook, icon: Facebook },
    { label: "YouTube", url: content.contact.social.youtube, icon: Youtube },
  ].filter((social) => Boolean(social.url));

  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="container py-14 sm:py-16">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Logo variant="dark" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-primary-foreground/75">
              {home.welcome}
            </p>
          </div>

          <nav aria-label="Navegação do rodapé">
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary-foreground/70">
              Navegação
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              {navigation.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary-foreground/70">
              Informações
            </h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="text-primary-foreground/70">Fundação</dt>
                <dd className="text-primary-foreground/90">{church.foundedAt}</dd>
              </div>
              <div>
                <dt className="text-primary-foreground/70">Origem</dt>
                <dd className="text-primary-foreground/90">
                  {church.city} · {church.state}
                </dd>
              </div>
              <div>
                <dt className="text-primary-foreground/70">Natureza</dt>
                <dd className="text-primary-foreground/90">{church.legalNature}</dd>
              </div>
            </dl>

            {socials.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {socials.map((social) => {
                  const Icon = social.icon;
                  return (
                    <li key={social.label}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${social.label} da igreja`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/25 text-primary-foreground/85 transition-colors hover:border-primary-foreground/50 hover:text-primary-foreground"
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/75 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {church.name} — {church.acronym}. Todos os direitos reservados.
          </p>
          <p>Desenvolvido por Nusaas</p>
        </div>
      </div>
    </footer>
  );
}
