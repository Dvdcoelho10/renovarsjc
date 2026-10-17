import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  defaultContent,
  type ContactInfo,
  type EventItem,
  type Highlight,
  type MessageItem,
  type SiteContent,
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
    mapEmbedUrl: asText(value.mapEmbedUrl, base.mapEmbedUrl),
    directionsUrl: asText(value.directionsUrl, base.directionsUrl),
    locationNote: asText(value.locationNote, base.locationNote),
    visitNote: asText(value.visitNote, base.visitNote),
    social: {
      instagram: asText(social.instagram, base.social.instagram),
      facebook: asText(social.facebook, base.social.facebook),
      youtube: asText(social.youtube, base.social.youtube),
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
        imageUrl: asText(value.imageUrl, ""),
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
        videoUrl: asText(value.videoUrl, ""),
        imageUrl: asText(value.imageUrl, ""),
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
        linkUrl: asText(value.linkUrl, ""),
      },
    ];
  });
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
      logoUrl: asText(church.logoUrl, defaults.church.logoUrl),
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
    ministryAreas: areas,
    events: normalizeEvents(value.events),
    messages: normalizeMessages(value.messages),
    highlights: normalizeHighlights(value.highlights),
  };
}

type ContentContextValue = {
  content: SiteContent;
  save: (next: SiteContent) => void;
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
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // Sem espaço no navegador: mantém a sessão atual mesmo sem persistir.
    }
    setContent(normalized);
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignora falhas de armazenamento.
    }
    setContent(clone(defaultContent));
  }, []);

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
