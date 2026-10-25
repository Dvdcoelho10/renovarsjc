import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
  type LucideIcon,
} from "lucide-react";

import { ContactMessageForm } from "@/components/site/ContactMessageForm";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/content/ContentProvider";
import {
  hasConfirmedAddress,
  hasContactInfo,
  type ContactInfo,
} from "@/content/site";
import { phoneHref, whatsappHref } from "@/lib/format";
import { usePageTitle } from "@/hooks/use-page-title";

type Channel = {
  label: string;
  value: string;
  href: string;
  external?: boolean;
  icon: LucideIcon;
};

function buildChannels(contact: ContactInfo): Channel[] {
  const channels: Channel[] = [];

  if (contact.phone) {
    channels.push({
      label: "Telefone",
      value: contact.phone,
      href: phoneHref(contact.phone),
      icon: Phone,
    });
  }
  if (contact.whatsapp) {
    channels.push({
      label: "WhatsApp",
      value: contact.whatsapp,
      href: whatsappHref(contact.whatsapp),
      external: true,
      icon: MessageCircle,
    });
  }
  if (contact.email) {
    channels.push({
      label: "E-mail",
      value: contact.email,
      href: `mailto:${contact.email}`,
      icon: Mail,
    });
  }

  return channels;
}

function buildSocials(contact: ContactInfo): Channel[] {
  const socials: Channel[] = [];

  if (contact.social.instagram) {
    socials.push({
      label: "Instagram",
      value: "Perfil oficial",
      href: contact.social.instagram,
      external: true,
      icon: Instagram,
    });
  }
  if (contact.social.facebook) {
    socials.push({
      label: "Facebook",
      value: "Página oficial",
      href: contact.social.facebook,
      external: true,
      icon: Facebook,
    });
  }
  if (contact.social.youtube) {
    socials.push({
      label: "YouTube",
      value: "Canal oficial",
      href: contact.social.youtube,
      external: true,
      icon: Youtube,
    });
  }

  return socials;
}

const Contato = () => {
  usePageTitle("Contato e localização");
  const { content } = useSiteContent();
  const { contact } = content;

  const channels = buildChannels(contact);
  const socials = buildSocials(contact);

  return (
    <>
      <PageHeader
        eyebrow={content.pages.contact.eyebrow}
        title={content.pages.contact.title}
        description={content.pages.contact.description}
        imageUrl={content.images.contactHero}
      />

      <section className="container py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="space-y-8">
            <ContactMessageForm
              recipient={contact.email || "contato@adrenovar.com.br"}
            />

            {hasContactInfo(contact) ? (
              <div className="space-y-8">
                {channels.length > 0 && (
                  <div>
                    <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
                      Canais oficiais
                    </h2>
                    <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                      {channels.map((channel) => {
                        const Icon = channel.icon;
                        return (
                          <li key={channel.label}>
                            <a
                              href={channel.href}
                              target={channel.external ? "_blank" : undefined}
                              rel={channel.external ? "noopener noreferrer" : undefined}
                              className="flex h-full items-start gap-4 rounded-2xl border border-border/80 bg-card p-5 transition-colors hover:border-primary/30"
                            >
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                                <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                  {channel.label}
                                </span>
                                <span className="mt-1 block break-words text-[0.98rem] font-medium text-foreground">
                                  {channel.value}
                                </span>
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {socials.length > 0 && (
                  <div>
                    <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
                      Redes sociais
                    </h2>
                    <ul className="mt-5 flex flex-wrap gap-3">
                      {socials.map((social) => {
                        const Icon = social.icon;
                        return (
                          <li key={social.label}>
                            <a
                              href={social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground transition-colors hover:border-primary/30"
                            >
                              <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                              {social.label}
                              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {contact.address && (
                  <div>
                    <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
                      Endereço
                    </h2>
                    <div className="mt-5 rounded-[1.5rem] border border-border/80 bg-card p-6">
                      <div className="flex items-start gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                          <MapPin className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-[1.02rem] leading-relaxed text-foreground">
                            {contact.address}
                          </p>
                          {contact.addressComplement && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {contact.addressComplement}
                            </p>
                          )}
                        </div>
                      </div>

                      {hasConfirmedAddress(contact) && (
                        <div className="mt-6 space-y-4">
                          <iframe
                            title="Mapa com a localização da igreja"
                            src={contact.mapEmbedUrl}
                            className="h-64 w-full rounded-2xl border border-border"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                          <Button asChild className="h-11 w-full rounded-full sm:w-auto">
                            <a
                              href={contact.directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver rota
                              <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden="true" />
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-border/80 bg-card p-7 sm:p-9">
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Em atualização
                </span>
                <h2 className="mt-5 text-[1.5rem] leading-snug sm:text-2xl">
                  Os canais de contato ainda não foram publicados
                </h2>
                <p className="mt-3 text-[0.98rem] leading-relaxed text-muted-foreground">
                  Telefone, WhatsApp e redes sociais serão divulgados aqui
                  somente depois de confirmados pela liderança. Não publicamos
                  contatos que não sejam oficiais.
                </p>
                <p className="mt-3 text-[0.98rem] leading-relaxed text-muted-foreground">
                  Enquanto isso, você pode conhecer a história da igreja e a
                  missão que orienta o nosso trabalho.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="h-11 rounded-full px-6">
                    <Link to="/sobre">Conhecer a igreja</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full border-border px-6 hover:bg-secondary"
                  >
                    <Link to="/">Voltar ao início</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-[1.5rem] border border-border/80 bg-secondary/50 p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card text-primary">
                  <MapPin className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg">Localização</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {contact.locationNote}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border/80 bg-card p-6">
              <h2 className="text-lg">Visite a igreja</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {contact.visitNote}
              </p>
              <Link
                to="/sobre"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Sobre a igreja
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
};

export default Contato;
