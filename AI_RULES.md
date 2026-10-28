# Tech Stack

- You are building a React application.
- Use TypeScript.
- Use React Router. KEEP the routes in src/App.tsx
- Always put source code in the src folder.
- Put pages into src/pages/
- Put components into src/components/
- The main page (default page) is src/pages/Index.tsx
- UPDATE the main page to include the new components. OTHERWISE, the user can NOT see any components!
- ALWAYS try to use the shadcn/ui library.
- Tailwind CSS: always use Tailwind CSS for styling components. Utilize Tailwind classes extensively for layout, spacing, colors, and other design aspects.

Available packages and libraries:

- The lucide-react package is installed for icons.
- You ALREADY have ALL the shadcn/ui components and their dependencies installed. So you don't need to install them again.
- You have ALL the necessary Radix UI components installed.
- Use prebuilt components from the shadcn/ui library after importing them. Note that these files shouldn't be edited, so make new components if you need to change them.

# Conteúdo institucional (Igreja Assembleia de Deus Renovar)

- O conteúdo padrão vive em `src/content/site.ts` e é servido/editado via `src/content/ContentProvider.tsx`. Páginas leem com `useSiteContent()`, nunca com textos duplicados.
- Nunca inventar pastores, liderança, horários de cultos, telefones, redes sociais, CNPJ, número de membros, testemunhos ou resultados de ações sociais.
- O endereço do estatuto é provisório: não publicar mapas nem rotas sem confirmação (`hasConfirmedAddress` exige endereço + mapa + rota).
- Agenda, Mensagens e Destaques só aparecem com conteúdo real. As rotas existem, mas devem mostrar estados vazios honestos.
- Áreas do estatuto (Evangelização, Educação Cristã, Ação Social) são *previstas*, não atividades confirmadas — manter o aviso nas seções.
- O estatuto não é publicado nem disponibilizado para download no site.
- Dízimos e ofertas: `content.giving` guarda `enabled`, título, instrução, nome na tarja, CNPJ (21.269.489/0001-71, confirmado pela igreja), QR Code (`/pix-qrcode.png`) e observação. O card fica em `src/components/site/GivingCard.tsx` e aparece ao lado do último vídeo (abaixo dele no celular), dentro de `LatestVideoSection`; também entra no ZIP de imagens do painel. Editável na aba Início do painel (`src/components/admin/GivingForm.tsx`), inclusive o upload do QR. Nunca trocar o QR Code nem o CNPJ sem confirmação da liderança.

# Painel administrativo (/admins)

- Rota `/admins`, fora do menu público. Autenticação **no servidor**: `POST /api/admin/login`/`logout`, `GET /api/admin/session` (`server/admin-api.mjs` + `server/auth.mjs`). Senha com hash scrypt em `admin_users`, sessão em cookie `adr_admin_session` (HttpOnly, SameSite=Strict, Secure em HTTPS) válida por 8 h, e cookie de dica `adr_admin_hint` (legível pelo JS) que só controla os atalhos de edição — nunca autoriza nada. Administrador criado por `pnpm admin:create` (`scripts/create-admin.mjs`), sem senha padrão no código. Cliente em `src/lib/admin-session.ts` e `src/hooks/use-admin-session.ts`.
- Edição na própria página: `PageEditor` (montado no `SiteLayout`) mostra “Editar esta página” para quem tem sessão/hint de admin e abre um painel com os textos, imagens, listas e links da página atual. Salva pelo `ContentProvider`; os campos compartilhados ficam em `src/components/admin/copy-fields.tsx`. Cabeçalhos de Agenda, Mensagens e Contato ficam em `content.pages`; o Sobre usa `about.eyebrow`.
- As abas do painel são as páginas do site (Início, Sobre, Agenda, Mensagens, Contato) e usam `PageEditorFields` — os mesmos campos da edição na própria página: textos, imagens, listas e links. Completam o painel as abas Páginas (criar e excluir páginas do menu), Identidade (dados da igreja, logo e download de imagens em ZIP) e YouTube.
- Páginas criadas no painel ficam em `content.customPages` e abrem em `/pagina/{slug}` (`src/pages/CustomPage.tsx`), entrando no menu do cabeçalho e do rodapé via `getNavigation`. Campo e formulário em `src/components/admin/CustomPageFields.tsx`; criar/excluir publica na hora (`PagesForm` → `onCommit`), textos e foto são salvos com “Salvar alterações”. O `slug` é definido na criação e não muda ao renomear o item do menu. Excluir remove do menu e o endereço deixa de existir.
- Imagens: `ImageField` otimiza no navegador (WebP, `src/lib/image.ts`), envia para `POST /api/admin/media` (autenticado) e guarda o endereço `/api/media/{id}` no conteúdo; a imagem fica na tabela `media` do MySQL (nada em `dist/` nem no disco). Também aceita colar uma URL. O mesmo campo troca e remove.
- Último vídeo do YouTube: a seção usa a rota de servidor `GET /api/youtube/latest` (`server/youtube.mjs`, servida pelo middleware do `vite.config.ts` em dev e por `server.mjs` em produção). `content.youtube` guarda apenas `enabled`, título e descrição. Canal e chave (`YOUTUBE_CHANNEL_ID`, `YOUTUBE_API_KEY`) ficam somente no `.env`/variáveis da Hostinger, nunca no bundle do cliente. A rota consulta `playlistItems` da playlist de uploads (1 unidade de cota, cache de 60 s no servidor) e `src/lib/youtube.ts` mantém cache de 2 min no navegador, reconsultando a cada 2 min e ao voltar para a aba. `LatestVideoSection` incorpora o player na página inicial, sempre com o vídeo mais recente e sem link que leve para fora do site.
- Formulário de contato: a página Contato tem o formulário em `src/components/site/ContactMessageForm.tsx`, que envia `POST /api/contact` (`server/contact.mjs`). O envio usa o SMTP da Hostinger com apenas `node:net`/`node:tls` (sem dependências extras): `SMTP_HOST` (smtp.hostinger.com), `SMTP_PORT` (465 com TLS ou 587 com STARTTLS), `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_NAME` e `CONTACT_TO_EMAIL`, todos só no `.env`/variáveis da Hostinger. Destino e remetente: contato@adrenovar.com.br (e-mail oficial confirmado pela igreja, também em `content.contact.email`). A rota valida os campos, limita 4 envios por IP a cada 15 min, descarta robôs pelo campo oculto `website` e responde `mail_not_configured` quando `SMTP_PASSWORD` está vazia. Sem esse envio funcionando, nunca afirmar no site que a mensagem chegou.
- Conteúdo publicado: `src/content/ContentProvider.tsx` lê `GET /api/content` (público, cache de 15 s) e grava em `PUT /api/admin/content` (sessão obrigatória + mesma origem), na tabela `site_content` (linha id = 1, JSON no mesmo formato de `SiteContent`). Só mostrar sucesso depois do `200`. O `sessionStorage` guarda um cache só para a primeira pintura; o `localStorage` antigo (`adr-site-content-v1`) é apenas migração assistida em `src/components/admin/LegacyContentMigration.tsx`, que nunca sobrescreve o banco sozinha nem apaga a cópia local antes do sucesso. Sem `DB_*`, o site usa o conteúdo padrão de `site.ts` e as rotas administrativas respondem `503 db_not_configured`.

# Servidor e hospedagem

- `pnpm build` gera `dist/`; `pnpm start` (`node server.mjs`) serve o build e as rotas `/api/youtube/latest`, `/api/contact`, `/api/content`, `/api/media/{id}` e `/api/admin/*`. Requer runtime Node.js (Hostinger VPS/Cloud). Hospedagem apenas estática/PHP não executa as APIs. `node scripts/check-setup.mjs` diagnostica env/banco/tabelas/administrador sem alterar nada.
- Segredos somente em `.env` (ignorado pelo git) ou nas variáveis de ambiente da Hostinger. Nunca usar prefixo `VITE_` em segredos — esse prefixo injeta o valor no bundle do cliente.
- Banco oficial: MySQL/MariaDB na Hostinger (phpMyAdmin). Migrações versionadas em `database/migrations/` (não destrutivas, rodadas manualmente — nunca no boot), acesso em `server/db.mjs` com pool e queries parametrizadas. Credenciais (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) ficam exclusivamente no `.env` ou nas variáveis da Hostinger e são lidas apenas por código de servidor. Nunca em `src/`, nunca no cliente e nunca com prefixo `VITE_`. Não usar Neon/Supabase.
- Rodapé: crédito "Desenvolvido por Nusaas" (substituiu a nota sobre o estatuto).
- `DEPLOY.md` documenta a configuração exata do hPanel (tipo Node.js, Node 22, `pnpm build`, `pnpm start`, `server.mjs`, `dist/`) e as variáveis obrigatórias. `public/logo-adr.png` é o emblema usado por `index.html` (favicon/og:image) e pelos componentes `Logo`/`EmblemPanel` — o arquivo precisa existir no build.
