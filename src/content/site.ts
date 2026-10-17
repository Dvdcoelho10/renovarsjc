/**
 * Fonte única de conteúdo institucional do site.
 *
 * Regras de preenchimento:
 * - Só publique dados confirmados pela igreja.
 * - Eventos, mensagens e destaques começam vazios de propósito: as seções
 *   correspondentes só aparecem quando houver conteúdo real.
 * - O endereço descrito no estatuto é provisório. Só preencha `address`,
 *   `mapEmbedUrl` e `directionsUrl` depois de confirmar o endereço atual.
 */

export const church = {
  name: "Igreja Assembleia de Deus Renovar",
  shortName: "Assembleia de Deus Renovar",
  acronym: "ADR",
  city: "São José dos Campos",
  state: "São Paulo",
  foundedAt: "23 de setembro de 2013",
  foundedIso: "2013-09-23",
  legalNature: "Associação sem fins lucrativos",
  mission:
    "Proclamar o Evangelho de nosso Senhor e Salvador Jesus Cristo, com a Bíblia como referência de fé e orientação.",
  welcome:
    "Uma comunidade cristã dedicada à proclamação do Evangelho de Jesus Cristo, orientada pela Palavra de Deus.",
};

/** Canais oficiais. Deixe vazio o que ainda não foi confirmado. */
export const contact = {
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  addressComplement: "",
  /** Link "incorporar mapa" do Google Maps — apenas com endereço confirmado. */
  mapEmbedUrl: "",
  /** Link de rota (Google Maps / Waze) — apenas com endereço confirmado. */
  directionsUrl: "",
  social: {
    instagram: "",
    facebook: "",
    youtube: "",
  },
};

export type EventItem = {
  id: string;
  title: string;
  description?: string;
  /** Data no formato AAAA-MM-DD */
  date: string;
  /** Horário legível, ex.: "19h30" */
  time?: string;
  location?: string;
  imageUrl?: string;
};

export type MessageKind = "reflexao" | "estudo" | "video";

export type MessageItem = {
  id: string;
  kind: MessageKind;
  title: string;
  summary: string;
  /** Corpo opcional, em parágrafos separados por linha em branco. */
  body?: string;
  /** Só preencha se a autoria for informada pela igreja. */
  author?: string;
  /** Data de publicação no formato AAAA-MM-DD */
  publishedAt: string;
  /** Link de vídeo fornecido pela igreja. */
  videoUrl?: string;
  imageUrl?: string;
};

export type Highlight = {
  id: string;
  title: string;
  description: string;
  linkLabel?: string;
  linkUrl?: string;
};

export const events: EventItem[] = [];

export const messages: MessageItem[] = [];

export const highlights: Highlight[] = [];

export const hasEvents = events.length > 0;
export const hasMessages = messages.length > 0;

export const hasContactInfo = Boolean(
  contact.phone ||
    contact.whatsapp ||
    contact.email ||
    contact.address ||
    contact.social.instagram ||
    contact.social.facebook ||
    contact.social.youtube,
);

export const hasConfirmedAddress = Boolean(
  contact.address && contact.mapEmbedUrl && contact.directionsUrl,
);

export const navigation = [
  { label: "Início", to: "/" },
  { label: "Sobre a igreja", to: "/sobre" },
  ...(hasEvents ? [{ label: "Cultos e agenda", to: "/agenda" }] : []),
  ...(hasMessages ? [{ label: "Mensagens", to: "/mensagens" }] : []),
  { label: "Contato", to: "/contato" },
];

export const ministryAreas = [
  {
    id: "evangelizacao",
    title: "Evangelização",
    description:
      "Anunciar a mensagem do Evangelho a quem ainda não a conhece, em fidelidade ao chamado de levar Cristo a todas as pessoas.",
  },
  {
    id: "educacao-crista",
    title: "Educação Cristã",
    description:
      "Ensino e formação na Palavra de Deus, para que a fé seja compreendida, vivida e compartilhada com clareza.",
  },
  {
    id: "acao-social",
    title: "Ação Social",
    description:
      "Atenção às necessidades das pessoas e cuidado com a comunidade, como expressão prática do amor cristão.",
  },
];
