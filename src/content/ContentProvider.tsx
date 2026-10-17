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
  type ContactInfo,
  type EventItem,
  type Highlight,
  type ImagesCopy,
  type MessageItem,
  type SiteContent,
  type YoutubeCopy,
} from "@/content/site";

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

export function normalizeContent(raw: unknown): SiteContent {
  const value = asRecord(raw);
  const church = asRecord(value.church);
  const home = asRecord(value.home);
  const about = asRecord(value.about);
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
    contact: normalizeContact(value.contact),
    images: normalizeImages(value.images),
    youtube: normalizeYoutube(value.youtube),
    ministryAreas: areas,
    events: normalizeEvents(value.events),
    messages: normalizeMessages(value.messages),
    highlights: normalizeHighlights(value.highlights),
  };
}

type ContentContextValue = {
  content: SiteContent;
  /** Retorna false quando o navegador não conseguiu armazenar o conteúdo. */
  save: (next: SiteContent) => boolean;
  reset: () => void;
};

const ContentContext = createContext<ContentContextValue | null>(null);

function loadStoredContent(): SiteContent {
  if (typeof window === "undefined") return clone(defaultContent);

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(defaultContent);
    return normalizeContent(JSON.parse(raw));
  } catch {
    return clone(defaultContent);
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(loadStoredContent);

  const save = useCallback((next: SiteContent) => {
    const normalized = normalizeContent(next);
    let stored = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      stored = false;
    }
    setContent(normalized);
    return stored;
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignora falhas de armazenamento.
    }
    setContent(clone(defaultContent));
  }, []);

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
    () => ({ content, save, reset }),
    [content, save, reset],
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
