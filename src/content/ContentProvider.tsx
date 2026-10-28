import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  defaultContent,
  slugify,
  type ContactInfo,
  type CustomPage,
  type CustomPageSection,
  type EventItem,
  type GivingCopy,
  type Highlight,
  type ImagesCopy,
  type MessageItem,
  type PageHeaderCopy,
  type SiteContent,
  type YoutubeCopy,
} from "@/content/site";

/**
 * Chave antiga da versão que salvava no navegador. O conteúdo publicado agora
 * vem de /api/content (MySQL); esta chave só existe para a migração assistida.
 */
const STORAGE_KEY = "adr-site-content-v1";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function asText(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Mantém apenas links seguros (http, https, mailto, tel ou caminho interno). */
function asLink(value: unknown, fallback = "") {
  let candidate = asText(value, fallback).trim();
  if (!candidate) return "";

  if (candidate.startsWith("/")) return candidate;
  if (/^[\w-]+(\.[\w-]+)+\/?/i.test(candidate) && !candidate.includes(":")) {
    candidate = `https://${candidate}`;
  }

  try {
    const url = new URL(candidate);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol)
      ? candidate
      : "";
  } catch {
    return "";
  }
}

/** Aceita data URL de imagem, caminho interno ou URL http(s). */
function asImage(value: unknown, fallback = "") {
  const candidate = asText(value, fallback).trim();
  if (!candidate) return "";
  if (candidate.startsWith("data:image/")) return candidate;
  if (
    candidate.startsWith("/") ||
    candidate.startsWith("http://") ||
    candidate.startsWith("https://")
  ) {
    return candidate;
  }
  return "";
}

function normalizeContact(raw: unknown): ContactInfo {
  const value = asRecord(raw);
  const social = asRecord(value.social);
  const base = defaultContent.contact;

  return {
    phone: asText(value.phone, base.phone),
    whatsapp: asText(value.whatsapp, base.whatsapp),
    email: asText(value.email, base.email),
    address: asText(value.address, base.address),
    addressComplement: asText(value.addressComplement, base.addressComplement),
    mapEmbedUrl: asLink(value.mapEmbedUrl, base.mapEmbedUrl),
    directionsUrl: asLink(value.directionsUrl, base.directionsUrl),
    locationNote: asText(value.locationNote, base.locationNote),
    visitNote: asText(value.visitNote, base.visitNote),
    social: {
      instagram: asLink(social.instagram, base.social.instagram),
      facebook: asLink(social.facebook, base.social.facebook),
      youtube: asLink(social.youtube, base.social.youtube),
    },
  };
}

function normalizeEvents(raw: unknown): EventItem[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item, index) => {
    const value = asRecord(item);
    const title = asText(value.title, "").trim();
    const date = asText(value.date, "").trim();
    if (!title || !date) return [];

    return [
      {
        id: asText(value.id, `event-${index}`),
        title,
        date,
        description: asText(value.description, ""),
        time: asText(value.time, ""),
        location: asText(value.location, ""),
        imageUrl: asImage(value.imageUrl),
      },
    ];
  });
}

function normalizeMessages(raw: unknown): MessageItem[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item, index) => {
    const value = asRecord(item);
    const title = asText(value.title, "").trim();
    if (!title) return [];

    const kind = asText(value.kind, "reflexao");
    return [
      {
        id: asText(value.id, `message-${index}`),
        title,
        kind:
          kind === "estudo" || kind === "video" ? kind : ("reflexao" as const),
        summary: asText(value.summary, ""),
        body: asText(value.body, ""),
        author: asText(value.author, ""),
        publishedAt: asText(value.publishedAt, ""),
        videoUrl: asLink(value.videoUrl),
        imageUrl: asImage(value.imageUrl),
      },
    ];
  });
}

function normalizeHighlights(raw: unknown): Highlight[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item, index) => {
    const value = asRecord(item);
    const title = asText(value.title, "").trim();
    if (!title) return [];

    return [
      {
        id: asText(value.id, `highlight-${index}`),
        title,
        description: asText(value.description, ""),
        linkLabel: asText(value.linkLabel, ""),
        linkUrl: asLink(value.linkUrl),
      },
    ];
  });
}

function normalizeCustomSections(raw: unknown): CustomPageSection[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item, index) => {
    const value = asRecord(item);
    const heading = asText(value.heading, "").trim();
    const body = asText(value.body, "").trim();
    if (!heading && !body) return [];

    return [
      {
        id: asText(value.id, `section-${index}`).trim() || `section-${index}`,
        heading,
        body,
      },
    ];
  });
}

function normalizeCustomPages(raw: unknown): CustomPage[] {
  if (!Array.isArray(raw)) return [];

  const usedSlugs = new Set<string>();

  return raw.flatMap((item, index) => {
    const value = asRecord(item);
    const menuLabel = asText(value.menuLabel, "").trim();
    const title = asText(value.title, "").trim();
    const baseSlug =
      slugify(asText(value.slug, "")) || slugify(menuLabel) || slugify(title);
    if (!baseSlug) return [];

    let slug = baseSlug;
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    usedSlugs.add(slug);

    return [
      {
        id: asText(value.id, `page-${index}`).trim() || `page-${index}`,
        slug,
        menuLabel: menuLabel || title,
        title: title || menuLabel,
        eyebrow: asText(value.eyebrow, "").trim(),
        description: asText(value.description, "").trim(),
        imageUrl: asImage(value.imageUrl),
        sections: normalizeCustomSections(value.sections),
      },
    ];
  });
}

function normalizeImages(raw: unknown): ImagesCopy {
  const value = asRecord(raw);
  const base = defaultContent.images;

  return {
    homeHero: asImage(value.homeHero, base.homeHero),
    homeMission: asImage(value.homeMission, base.homeMission),
    aboutHero: asImage(value.aboutHero, base.aboutHero),
    aboutBible: asImage(value.aboutBible, base.aboutBible),
    agendaHero: asImage(value.agendaHero, base.agendaHero),
    messagesHero: asImage(value.messagesHero, base.messagesHero),
    contactHero: asImage(value.contactHero, base.contactHero),
  };
}

const legacyYoutubeTitles = ["Transmissão ao vivo", "Último vídeo do canal"];
const legacyYoutubeDescription =
  "Acompanhe os cultos e as transmissões da TV Renovar, o canal oficial da Assembleia de Deus Renovar no YouTube.";

function normalizeYoutube(raw: unknown): YoutubeCopy {
  const value = asRecord(raw);
  const base = defaultContent.youtube;
  const storedTitle = asText(value.title, base.title);
  const storedDescription = asText(value.description, base.description);

  return {
    enabled: typeof value.enabled === "boolean" ? value.enabled : base.enabled,
    // Migração do bloco antigo para o novo texto de "último vídeo".
    title: legacyYoutubeTitles.includes(storedTitle) ? base.title : storedTitle,
    description:
      storedDescription === legacyYoutubeDescription
        ? base.description
        : storedDescription,
  };
}

function normalizeGiving(raw: unknown): GivingCopy {
  const value = asRecord(raw);
  const base = defaultContent.giving;

  return {
    enabled: typeof value.enabled === "boolean" ? value.enabled : base.enabled,
    title: asText(value.title, base.title),
    description: asText(value.description, base.description),
    legalName: asText(value.legalName, base.legalName),
    cnpj: asText(value.cnpj, base.cnpj),
    qrImageUrl: asImage(value.qrImageUrl, base.qrImageUrl),
    note: asText(value.note, base.note),
  };
}

function normalizePageHeader(
  raw: unknown,
  base: PageHeaderCopy,
): PageHeaderCopy {
  const value = asRecord(raw);

  return {
    eyebrow: asText(value.eyebrow, base.eyebrow),
    title: asText(value.title, base.title),
    description: asText(value.description, base.description),
  };
}

export function normalizeContent(raw: unknown): SiteContent {
  const value = asRecord(raw);
  const church = asRecord(value.church);
  const home = asRecord(value.home);
  const about = asRecord(value.about);
  const pages = asRecord(value.pages);
  const defaults = defaultContent;

  const paragraphs = Array.isArray(about.paragraphs)
    ? about.paragraphs.filter(
        (paragraph): paragraph is string => typeof paragraph === "string",
      )
    : clone(defaults.about.paragraphs);

  const areas = Array.isArray(value.ministryAreas)
    ? value.ministryAreas.map((area, index) => {
        const item = asRecord(area);
        const fallback = defaults.ministryAreas[index] ?? defaults.ministryAreas[0];
        return {
          id: asText(item.id, fallback.id),
          title: asText(item.title, fallback.title),
          description: asText(item.description, fallback.description),
        };
      })
    : clone(defaults.ministryAreas);

  return {
    church: {
      name: asText(church.name, defaults.church.name),
      shortName: asText(church.shortName, defaults.church.shortName),
      acronym: asText(church.acronym, defaults.church.acronym),
      city: asText(church.city, defaults.church.city),
      state: asText(church.state, defaults.church.state),
      foundedAt: asText(church.foundedAt, defaults.church.foundedAt),
      legalNature: asText(church.legalNature, defaults.church.legalNature),
      missionStatement: asText(
        church.missionStatement,
        defaults.church.missionStatement,
      ),
      logoUrl: asImage(church.logoUrl, defaults.church.logoUrl),
    },
    home: {
      heroEyebrow: asText(home.heroEyebrow, defaults.home.heroEyebrow),
      heroGreeting: asText(home.heroGreeting, defaults.home.heroGreeting),
      heroTitle: asText(home.heroTitle, defaults.home.heroTitle),
      welcome: asText(home.welcome, defaults.home.welcome),
      missionTitle: asText(home.missionTitle, defaults.home.missionTitle),
      missionLead: asText(home.missionLead, defaults.home.missionLead),
      missionBody: asText(home.missionBody, defaults.home.missionBody),
      inviteTitle: asText(home.inviteTitle, defaults.home.inviteTitle),
      inviteDescription: asText(
        home.inviteDescription,
        defaults.home.inviteDescription,
      ),
    },
    about: {
      eyebrow: asText(about.eyebrow, defaults.about.eyebrow),
      title: asText(about.title, defaults.about.title),
      description: asText(about.description, defaults.about.description),
      bibleText: asText(about.bibleText, defaults.about.bibleText),
      paragraphs,
      areasNote: asText(about.areasNote, defaults.about.areasNote),
      contentNote: asText(about.contentNote, defaults.about.contentNote),
      inviteTitle: asText(about.inviteTitle, defaults.about.inviteTitle),
      inviteDescription: asText(
        about.inviteDescription,
        defaults.about.inviteDescription,
      ),
    },
    pages: {
      agenda: normalizePageHeader(pages.agenda, defaults.pages.agenda),
      messages: normalizePageHeader(pages.messages, defaults.pages.messages),
      contact: normalizePageHeader(pages.contact, defaults.pages.contact),
    },
    contact: normalizeContact(value.contact),
    images: normalizeImages(value.images),
    youtube: normalizeYoutube(value.youtube),
    giving: normalizeGiving(value.giving),
    ministryAreas: areas,
    events: normalizeEvents(value.events),
    messages: normalizeMessages(value.messages),
    highlights: normalizeHighlights(value.highlights),
    customPages: normalizeCustomPages(value.customPages),
  };
}

export type SaveResult = { ok: boolean; error?: string };

type ContentContextValue = {
  content: SiteContent;
  /** "ready" depois da primeira consulta ao servidor. */
  status: "loading" | "ready";
  /** false quando o servidor respondeu que o banco ainda não está configurado. */
  dbConfigured: boolean;
  save: (next: SiteContent) => Promise<SaveResult>;
  reset: () => Promise<SaveResult>;
  reload: () => Promise<void>;
};

const ContentContext = createContext<ContentContextValue | null>(null);

const CACHE_KEY = "adr-content-cache-v2";
const CONTENT_ENDPOINT = "/api/content";
const ADMIN_CONTENT_ENDPOINT = "/api/admin/content";

function readCache(): SiteContent | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return normalizeContent(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeCache(next: SiteContent) {
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(next));
  } catch {
    // Cache é opcional: só evita piscar o conteúdo padrão ao trocar de página.
  }
}

/** Conteúdo antigo salvo no navegador pela versão que usava localStorage. */
export function readLegacyContent(): SiteContent | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeContent(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function hasLegacyContent() {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}

export function clearLegacyContent() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignora falhas de armazenamento.
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(
    () => readCache() ?? clone(defaultContent),
  );
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [dbConfigured, setDbConfigured] = useState(true);

  const applyContent = useCallback((next: SiteContent) => {
    setContent(next);
    writeCache(next);
  }, []);

  const reload = useCallback(async () => {
    try {
      const response = await fetch(CONTENT_ENDPOINT, {
        headers: { Accept: "application/json" },
      });
      const data = (await response.json().catch(() => ({}))) as {
        content?: unknown;
        error?: string;
      };

      setDbConfigured(data?.error !== "db_not_configured");
      if (data?.content) applyContent(normalizeContent(data.content));
    } catch {
      // Sem servidor: mantém o conteúdo padrão ou o cache desta aba.
    } finally {
      setStatus("ready");
    }
  }, [applyContent]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(
    async (next: SiteContent): Promise<SaveResult> => {
      const normalized = normalizeContent(next);

      try {
        const response = await fetch(ADMIN_CONTENT_ENDPOINT, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ content: normalized }),
        });
        const data = (await response.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
        };

        if (!response.ok || !data?.ok) {
          return {
            ok: false,
            error: typeof data?.error === "string" ? data.error : "save_failed",
          };
        }

        applyContent(normalized);
        return { ok: true };
      } catch {
        return { ok: false, error: "network_error" };
      }
    },
    [applyContent],
  );

  const reset = useCallback(
    () => save(clone(defaultContent)),
    [save],
  );

  // Mantém o favicon alinhado com a logo escolhida no painel.
  useEffect(() => {
    const logoSrc = content.church.logoUrl || "/logo-adr.png";
    let icon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    icon.href = logoSrc;
  }, [content.church.logoUrl]);

  const value = useMemo(
    () => ({ content, status, dbConfigured, save, reset, reload }),
    [content, status, dbConfigured, save, reset, reload],
  );

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useSiteContent deve ser usado dentro de ContentProvider");
  }
  return context;
}
