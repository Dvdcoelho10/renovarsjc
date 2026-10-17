/**
 * Conteúdo padrão do site e formato dos dados editáveis no painel /admins.
 *
 * Regras de preenchimento:
 * - Só publique dados confirmados pela igreja.
 * - Agenda, mensagens e destaques começam vazios de propósito.
 * - O endereço descrito no estatuto é provisório. Só preencha `address`,
 *   `mapEmbedUrl` e `directionsUrl` depois de confirmar o endereço atual.
 */

export type ChurchInfo = {
  name: string;
  shortName: string;
  acronym: string;
  city: string;
  state: string;
  foundedAt: string;
  legalNature: string;
  /** Frase curta de missão exibida no menu mobile. */
  missionStatement: string;
  /** Caminho ou URL da logo. */
  logoUrl: string;
};

export type HomeCopy = {
  heroEyebrow: string;
  heroGreeting: string;
  heroTitle: string;
  welcome: string;
  missionTitle: string;
  missionLead: string;
  missionBody: string;
  inviteTitle: string;
  inviteDescription: string;
};

export type AboutCopy = {
  title: string;
  description: string;
  bibleText: string;
  paragraphs: string[];
  areasNote: string;
  contentNote: string;
  inviteTitle: string;
  inviteDescription: string;
};

export type ImagesCopy = {
  /** Foto do destaque da página inicial. */
  homeHero: string;
  /** Foto do bloco de missão na página inicial. */
  homeMission: string;
  /** Foto de abertura da página Sobre. */
  aboutHero: string;
  /** Foto do bloco sobre a Bíblia. */
  aboutBible: string;
  /** Foto de abertura da página Agenda. */
  agendaHero: string;
  /** Foto de abertura da página Mensagens. */
  messagesHero: string;
  /** Foto de abertura da página Contato. */
  contactHero: string;
};

export type YoutubeCopy = {
  /** Exibe a seção de transmissão no site. */
  enabled: boolean;
  /** ID do canal (começa com "UC") ou link do canal. */
  channel: string;
  /** Link de uma transmissão específica (tem prioridade sobre o canal). */
  videoUrl: string;
  /** Link público do canal, usado no botão "Abrir no YouTube". */
  channelUrl: string;
  /** Chave da YouTube Data API v3 usada para detectar a live. */
  apiKey: string;
  title: string;
  description: string;
};

export type ContactInfo = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  addressComplement: string;
  mapEmbedUrl: string;
  directionsUrl: string;
  /** Aviso exibido no bloco "Localização". */
  locationNote: string;
  /** Texto exibido no bloco "Visite a igreja". */
  visitNote: string;
  social: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
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
  body?: string;
  /** Só preencha se a autoria for informada pela igreja. */
  author?: string;
  /** Data de publicação no formato AAAA-MM-DD */
  publishedAt: string;
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

export type MinistryArea = {
  id: string;
  title: string;
  description: string;
};

export type SiteContent = {
  church: ChurchInfo;
  home: HomeCopy;
  about: AboutCopy;
  contact: ContactInfo;
  images: ImagesCopy;
  youtube: YoutubeCopy;
  ministryAreas: MinistryArea[];
  events: EventItem[];
  messages: MessageItem[];
  highlights: Highlight[];
};

export const defaultContent: SiteContent = {
  church: {
    name: "Igreja Assembleia de Deus Renovar",
    shortName: "Assembleia de Deus Renovar",
    acronym: "ADR",
    city: "São José dos Campos",
    state: "São Paulo",
    foundedAt: "23 de setembro de 2013",
    legalNature: "Associação sem fins lucrativos",
    missionStatement:
      "Proclamar o Evangelho de nosso Senhor e Salvador Jesus Cristo, com a Bíblia como referência de fé e orientação.",
    logoUrl: "/logo-adr.png",
  },

  home: {
    heroEyebrow: "Uma igreja em São José dos Campos",
    heroGreeting: "Bem-vindo à",
    heroTitle: "Assembleia de Deus Renovar",
    welcome:
      "Uma comunidade cristã dedicada à proclamação do Evangelho de Jesus Cristo, orientada pela Palavra de Deus.",
    missionTitle: "Proclamar o Evangelho de Jesus Cristo",
    missionLead:
      "A razão de existir da Assembleia de Deus Renovar é anunciar a mensagem de nosso Senhor e Salvador Jesus Cristo. Essa missão é vivida com a Bíblia como referência de fé, de ensino e de orientação para a vida cristã.",
    missionBody:
      "Como associação sem fins lucrativos, a igreja existe para servir pessoas — acolhendo quem chega, ensinando a Palavra e cuidando da comunidade. O estatuto prevê três áreas de atuação: evangelização, educação cristã e ação social.",
    inviteTitle: "Venha conhecer a comunidade",
    inviteDescription:
      "Se você procura uma igreja para caminhar na fé, ou deseja apenas conversar, será bem-vindo. Os canais oficiais de contato serão publicados assim que forem confirmados pela liderança.",
  },

  about: {
    title: "Uma igreja que nasceu em São José dos Campos",
    description:
      "Conheça a origem, a missão e os princípios que orientam a Igreja Assembleia de Deus Renovar.",
    bibleText:
      "A Escritura orienta a fé, o ensino e a vida da igreja. É dela que vem a mensagem que a Assembleia de Deus Renovar anuncia: a salvação em Jesus Cristo.",
    paragraphs: [
      "A Bíblia é a referência de fé e a orientação para tudo o que a igreja ensina e pratica. É a partir dela que buscamos viver o amor a Deus, o cuidado com as pessoas e o compromisso com a verdade.",
      "A ADR reúne pessoas que compartilham a mesma esperança em Cristo. Este site existe para apresentar a igreja com clareza e para abrir um caminho de contato com quem deseja conhecê-la.",
    ],
    areasNote:
      "Informações sobre ações em andamento, encontros e projetos serão publicadas pela liderança quando confirmadas. Até lá, nenhuma atividade é apresentada como existente.",
    contentNote:
      "O conteúdo institucional desta página foi elaborado a partir do estatuto da igreja, que orienta a apresentação sem ser reproduzido na íntegra. Dados de contato, programação e projetos aparecem apenas quando confirmados pela liderança.",
    inviteTitle: "Quer conhecer a igreja?",
    inviteDescription:
      "Será uma alegria receber você. Os canais oficiais de contato serão publicados assim que forem confirmados pela liderança.",
  },

  contact: {
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    addressComplement: "",
    mapEmbedUrl: "",
    directionsUrl: "",
    locationNote:
      "Ainda não publicamos o endereço da igreja. O endereço que consta no estatuto é provisório e não representa o local atual, por isso o mapa e o botão de rota serão adicionados apenas quando a liderança confirmar o endereço.",
    visitNote:
      "Se você deseja conhecer a Assembleia de Deus Renovar, acompanhe a publicação dos horários de cultos e dos canais de contato. Será uma alegria receber você.",
    social: {
      instagram: "",
      facebook: "",
      youtube: "",
    },
  },

  ministryAreas: [
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
  ],

  images: {
    homeHero: "",
    homeMission: "",
    aboutHero: "",
    aboutBible: "",
    agendaHero: "",
    messagesHero: "",
    contactHero: "",
  },

  // Canal oficial: TV Renovar | Assembleia de Deus Renovar.
  // A chave da API fica no navegador; restrinja por HTTP referrer no Google Cloud.
  youtube: {
    enabled: true,
    channel: "UCpnq0C4PXHGSIV2mjNAVrBw",
    videoUrl: "",
    channelUrl: "https://www.youtube.com/channel/UCpnq0C4PXHGSIV2mjNAVrBw",
    apiKey: "AIzaSyC4y3jOVmWITC-mAy3UUfhnGZYqdQq2Uu4",
    title: "Transmissão ao vivo",
    description:
      "Acompanhe os cultos e as transmissões da TV Renovar, o canal oficial da Assembleia de Deus Renovar no YouTube.",
  },

  events: [],
  messages: [],
  highlights: [],
};

// A chave da API é pública no bundle do site (uso típico do YouTube Data API
// no navegador). Restrinja por HTTP referrer no Google Cloud.

/** Extrai o ID de um vídeo do YouTube a partir de links comuns. */
export function getYoutubeVideoId(value: string) {
  const input = value.trim();
  if (!input) return "";

  if (/^[\w-]{11}$/.test(input)) return input;

  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/live\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }

  return "";
}

/** Extrai o ID do canal (UC...) a partir do campo informado. */
export function getYoutubeChannelId(value: string) {
  const input = value.trim();
  if (!input) return "";
  if (/^UC[\w-]{22}$/.test(input)) return input;

  const match = input.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
  return match ? match[1] : "";
}

export function getNavigation(content: SiteContent) {
  return [
    { label: "Início", to: "/" },
    { label: "Sobre a igreja", to: "/sobre" },
    ...(content.events.length > 0
      ? [{ label: "Cultos e agenda", to: "/agenda" }]
      : []),
    ...(content.messages.length > 0
      ? [{ label: "Mensagens", to: "/mensagens" }]
      : []),
    { label: "Contato", to: "/contato" },
  ];
}

export function hasContactInfo(contact: ContactInfo) {
  return Boolean(
    contact.phone ||
      contact.whatsapp ||
      contact.email ||
      contact.address ||
      contact.social.instagram ||
      contact.social.facebook ||
      contact.social.youtube,
  );
}

export function hasConfirmedAddress(contact: ContactInfo) {
  return Boolean(
    contact.address && contact.mapEmbedUrl && contact.directionsUrl,
  );
}
