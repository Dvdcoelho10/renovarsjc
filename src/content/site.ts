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

export type PageHeaderCopy = {
  eyebrow: string;
  title: string;
  description: string;
};

/** Cabeçalhos das páginas internas (Agenda, Mensagens e Contato). */
export type PagesCopy = {
  agenda: PageHeaderCopy;
  messages: PageHeaderCopy;
  contact: PageHeaderCopy;
};

/** Bloco de texto de uma página criada pelo painel. */
export type CustomPageSection = {
  id: string;
  heading: string;
  body: string;
};

/**
 * Página criada pela liderança no painel. Aparece no menu do cabeçalho e
 * pode ser editada na própria página.
 */
export type CustomPage = {
  id: string;
  /** Endereço da página: /pagina/{slug}. Definido na criação. */
  slug: string;
  /** Texto exibido no menu do cabeçalho. */
  menuLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  sections: CustomPageSection[];
};

/** Marco da história da igreja (ano + acontecimento confirmado). */
export type HistoryMilestone = {
  id: string;
  year: string;
  title: string;
  description: string;
};

/** Pastor, pastora ou líder apresentado no site. */
export type PersonProfile = {
  id: string;
  /** Ex.: "Pastor", "Pastora", "Líder de louvor". */
  role: string;
  name: string;
  /** Biografia escrita pela liderança. Vazio = não publicamos texto inventado. */
  bio: string;
  photoUrl: string;
};

/** Ministério da igreja e o líder responsável. */
export type Ministry = {
  id: string;
  title: string;
  /** Nome do líder. Vazio = "Liderança a confirmar". */
  leader: string;
  description: string;
};

/** Item de "Nosso Cremos". */
export type BeliefItem = {
  id: string;
  title: string;
  description: string;
};

/** Encontro fixo da semana (agenda cotidiana). */
export type WeeklyMeeting = {
  id: string;
  /** Ex.: "Domingo". */
  day: string;
  /** Ex.: "19h". */
  time: string;
  title: string;
  note: string;
};

/** Links institucionais externos (projeto Renovar Nações e Bíblia on-line). */
export type InstitutionalLinks = {
  nationsLabel: string;
  nationsUrl: string;
  bibleLabel: string;
  bibleUrl: string;
};

export type AboutCopy = {
  eyebrow: string;
  title: string;
  description: string;
  bibleText: string;
  paragraphs: string[];
  areasNote: string;
  contentNote: string;
  inviteTitle: string;
  inviteDescription: string;
  /** Títulos das seções institucionais da página Sobre. */
  historyTitle: string;
  historyDescription: string;
  pastorsEyebrow: string;
  pastorsTitle: string;
  pastorsIntro: string;
  ministriesEyebrow: string;
  ministriesTitle: string;
  ministriesIntro: string;
  creedEyebrow: string;
  creedTitle: string;
  creedIntro: string;
  statuteEyebrow: string;
  statuteTitle: string;
  statuteSummary: string[];
  statuteNote: string;
  /** Texto do bloco de missão da página Sobre. */
  missionTitle: string;
  missionBody: string;
  missionNationsNote: string;
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
  /** Exibe a seção do último vídeo no site. */
  enabled: boolean;
  title: string;
  description: string;
};

/** Bloco de dízimos e ofertas com o QR Code Pix da igreja. */
export type GivingCopy = {
  /** Exibe o bloco no site. */
  enabled: boolean;
  title: string;
  description: string;
  /** Nome que aparece na tarja abaixo do QR Code. */
  legalName: string;
  /** CNPJ da igreja, usado também como chave Pix. */
  cnpj: string;
  /** Imagem do QR Code (upload ou URL). */
  qrImageUrl: string;
  /** Observação curta abaixo do botão de copiar. */
  note: string;
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
  pages: PagesCopy;
  contact: ContactInfo;
  images: ImagesCopy;
  youtube: YoutubeCopy;
  giving: GivingCopy;
  ministryAreas: MinistryArea[];
  /** Marcos da história da igreja (página Sobre). */
  history: HistoryMilestone[];
  /** Pastores e pastoras (página Sobre). */
  pastors: PersonProfile[];
  /** Ministérios e líderes (página Sobre). */
  ministries: Ministry[];
  /** "Nosso Cremos" (página Sobre). */
  creed: BeliefItem[];
  /** Agenda cotidiana: encontros fixos da semana (página Agenda). */
  weeklyMeetings: WeeklyMeeting[];
  links: InstitutionalLinks;
  events: EventItem[];
  messages: MessageItem[];
  highlights: Highlight[];
  /** Páginas criadas no painel, exibidas no menu do cabeçalho. */
  customPages: CustomPage[];
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
    eyebrow: "Sobre a igreja",
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
    historyTitle: "Nossa história",
    historyDescription:
      "A história da igreja começa na fundação, em 23 de setembro de 2013, e segue sendo construída pelas pessoas que dela participam.",
    pastorsEyebrow: "Liderança",
    pastorsTitle: "Nossos pastores",
    pastorsIntro:
      "A liderança da igreja é apresentada abaixo. As biografias são publicadas pela própria liderança.",
    ministriesEyebrow: "Ministérios",
    ministriesTitle: "Nossos ministérios e líderes",
    ministriesIntro:
      "Frentes de serviço da igreja, com a liderança responsável por cada uma delas.",
    creedEyebrow: "Declaração de fé",
    creedTitle: "Nosso Cremos",
    creedIntro:
      "Os pontos de fé publicados pela liderança da Assembleia de Deus Renovar.",
    statuteEyebrow: "Documento institucional",
    statuteTitle: "Nosso estatuto",
    statuteSummary: [
      "O estatuto rege a igreja como associação sem fins lucrativos, fundada em 23 de setembro de 2013, em São José dos Campos, São Paulo, com a finalidade de proclamar o Evangelho de nosso Senhor e Salvador Jesus Cristo.",
      "O documento prevê três áreas de atuação — evangelização, educação cristã e ação social. A previsão de uma área no estatuto não confirma, por si só, atividades, departamentos ou projetos em funcionamento.",
    ],
    statuteNote:
      "O estatuto completo não é reproduzido nem disponibilizado para download neste site. A liderança pode apresentá-lo a quem solicitar pelos canais oficiais de contato.",
    missionTitle: "Nossa missão como igreja",
    missionBody:
      "A Assembleia de Deus Renovar existe para proclamar o Evangelho de Jesus Cristo, ensinar a Palavra e servir pessoas — acolhendo quem chega e cuidando da comunidade.",
    missionNationsNote:
      "Conheça também o projeto Renovar Nações, indicado pela liderança da igreja.",
  },

  pages: {
    agenda: {
      eyebrow: "Cultos e agenda",
      title: "Nossos encontros e a programação da igreja",
      description:
        "Horários de cultos, encontros e eventos serão publicados nesta página pela liderança, com data, horário e local confirmados.",
    },
    messages: {
      eyebrow: "Mensagens e conteúdos",
      title: "Reflexões, estudos e vídeos da igreja",
      description:
        "Conteúdos publicados pela liderança da Assembleia de Deus Renovar. Nada é publicado sem confirmação da igreja.",
    },
    contact: {
      eyebrow: "Contato e localização",
      title: "Fale com a igreja",
      description:
        "Canais oficiais de contato, endereço e informações para visita. Publicamos apenas dados confirmados pela liderança.",
    },
  },

  contact: {
    phone: "",
    whatsapp: "",
    email: "contato@adrenovar.com.br",
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

  history: [
    {
      id: "fundacao",
      year: "23 de setembro de 2013",
      title: "Fundação da igreja",
      description:
        "Em São José dos Campos, São Paulo, a Igreja Assembleia de Deus Renovar é constituída como associação sem fins lucrativos, com a finalidade de proclamar o Evangelho de Jesus Cristo.",
    },
  ],

  // Nomes informados pela igreja. Biografias e fotos entram pelo painel —
  // nenhum texto de apresentação é escrito sem a liderança.
  pastors: [
    { id: "pastor-ricardo", role: "Pastor", name: "Ricardo", bio: "", photoUrl: "" },
    { id: "pastora-rosa", role: "Pastora", name: "Rosa", bio: "", photoUrl: "" },
  ],

  // Vazio de propósito: ministérios e líderes só entram quando confirmados.
  ministries: [],
  // Vazio de propósito: a declaração de fé é publicada pela liderança.
  creed: [],
  // Vazio de propósito: horários de cultos exigem confirmação da igreja.
  weeklyMeetings: [],

  links: {
    nationsLabel: "Renovar Nações",
    nationsUrl: "",
    bibleLabel: "Ler a Bíblia on-line",
    bibleUrl: "",
  },

  images: {
    homeHero: "",
    homeMission: "",
    aboutHero: "",
    aboutBible: "",
    agendaHero: "",
    messagesHero: "",
    contactHero: "",
  },

  // Canal e chave da YouTube Data API ficam no servidor (.env).
  youtube: {
    enabled: true,
    title: "Assista ao último vídeo",
    description:
      "Sempre que a TV Renovar publica um novo vídeo, ele aparece aqui automaticamente. Assista sem sair do site.",
  },

  // QR Code Pix confirmado pela igreja (CNPJ 21.269.489/0001-71).
  giving: {
    enabled: true,
    title: "Dízimos e ofertas",
    description:
      "Aponte a câmera do celular para o QR Code e faça sua contribuição pelo aplicativo do seu banco.",
    legalName: "Assembleia de Deus Renovar",
    cnpj: "21.269.489/0001-71",
    qrImageUrl: "/pix-qrcode.png",
    note:
      "A chave Pix da igreja é o CNPJ. Dízimos e ofertas são contribuições voluntárias.",
  },

  events: [],
  messages: [],
  highlights: [],
  customPages: [],
};

/** Endereço público de uma página criada no painel. */
export function customPagePath(slug: string) {
  return `/pagina/${slug}`;
}

/** Converte um texto em endereço: sem acentos, minúsculo e com hífens. */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function getNavigation(content: SiteContent) {
  return [
    { label: "Início", to: "/" },
    { label: "Sobre a igreja", to: "/sobre" },
    ...content.customPages.map((page) => ({
      label: page.menuLabel || page.title,
      to: customPagePath(page.slug),
    })),
    ...(content.events.length > 0 || content.weeklyMeetings.length > 0
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
