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

- Rota `/admins`, fora do menu público. Login em `src/lib/admin-auth.ts` (credenciais definidas pela igreja); a sessão fica no `localStorage` (com fallback em `sessionStorage`) para valer em todas as abas por 8 horas.
- Edição na própria página: `PageEditor` (montado no `SiteLayout`) mostra “Editar esta página” para quem tem sessão/hint de admin e abre um painel com os textos, imagens, listas e links da página atual. Salva pelo `ContentProvider`; os campos compartilhados ficam em `src/components/admin/copy-fields.tsx`. Cabeçalhos de Agenda, Mensagens e Contato ficam em `content.pages`; o Sobre usa `about.eyebrow`.
- As abas do painel são as páginas do site (Início, Sobre, Agenda, Mensagens, Contato) e usam `PageEditorFields` — os mesmos campos da edição na própria página: textos, imagens, listas e links. Completam o painel as abas Páginas (criar e excluir páginas do menu), Identidade (dados da igreja, logo e download de imagens em ZIP) e YouTube.
- Páginas criadas no painel ficam em `content.customPages` e abrem em `/pagina/{slug}` (`src/pages/CustomPage.tsx`), entrando no menu do cabeçalho e do rodapé via `getNavigation`. Campo e formulário em `src/components/admin/CustomPageFields.tsx`; criar/excluir publica na hora (`PagesForm` → `onCommit`), textos e foto são salvos com “Salvar alterações”. O `slug` é definido na criação e não muda ao renomear o item do menu. Excluir remove do menu e o endereço deixa de existir.
- Imagens: `ImageField` aceita upload do computador (otimizado para WebP via `src/lib/image.ts` e salvo como data URL) ou URL. O mesmo campo troca e remove.
- Último vídeo do YouTube: a seção usa a rota de servidor `GET /api/youtube/latest` (`server/youtube.mjs`, servida pelo middleware do `vite.config.ts` em dev e por `server.mjs` em produção). `content.youtube` guarda apenas `enabled`, título e descrição. Canal e chave (`YOUTUBE_CHANNEL_ID`, `YOUTUBE_API_KEY`) ficam somente no `.env`/variáveis da Hostinger, nunca no bundle do cliente. A rota consulta `playlistItems` da playlist de uploads (1 unidade de cota, cache de 60 s no servidor) e `src/lib/youtube.ts` mantém cache de 2 min no navegador, reconsultando a cada 2 min e ao voltar para a aba. `LatestVideoSection` incorpora o player na página inicial, sempre com o vídeo mais recente e sem link que leve para fora do site.
- Formulário de contato: a página Contato tem o formulário em `src/components/site/ContactMessageForm.tsx`, que envia `POST /api/contact` (`server/contact.mjs`). O envio usa o SMTP da Hostinger com apenas `node:net`/`node:tls` (sem dependências extras): `SMTP_HOST` (smtp.hostinger.com), `SMTP_PORT` (465 com TLS ou 587 com STARTTLS), `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_NAME` e `CONTACT_TO_EMAIL`, todos só no `.env`/variáveis da Hostinger. Destino e remetente: contato@adrenovar.com.br (e-mail oficial confirmado pela igreja, também em `content.contact.email`). A rota valida os campos, limita 4 envios por IP a cada 15 min, descarta robôs pelo campo oculto `website` e responde `mail_not_configured` quando `SMTP_PASSWORD` está vazia. Sem esse envio funcionando, nunca afirmar no site que a mensagem chegou.
- O conteúdo do painel e o login continuam em `localStorage` (~5 MB), por navegador; imagens grandes podem estourar a cota e `save()` retorna `false`. Não prometer publicação para todos os visitantes até conectar um banco e mover autenticação + conteúdo para o servidor.

# Servidor e hospedagem

- `npm run build` gera `dist/`; `npm start` (`node server.mjs`) serve o build e as rotas `/api/youtube/latest` e `/api/contact`. Requer runtime Node.js (Hostinger VPS/Cloud). Hospedagem apenas estática/PHP não executa as APIs.
- Segredos somente em `.env` (ignorado pelo git) ou nas variáveis de ambiente da Hostinger. Nunca usar prefixo `VITE_` em segredos — esse prefixo injeta o valor no bundle do cliente.
- Banco oficial: MySQL na Hostinger (phpMyAdmin), schema em `database/schema.sql`. Credenciais (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) ficam exclusivamente no `.env` ou nas variáveis da Hostinger e são lidas apenas por código de servidor. Nunca em `src/`, nunca no cliente e nunca com prefixo `VITE_`. Não usar Neon/Supabase.
- Rodapé: crédito "Desenvolvido por Nusaas" (substituiu a nota sobre o estatuto).
- `DEPLOY.md` documenta a configuração exata do hPanel (tipo Node.js, Node 22, `pnpm build`, `pnpm start`, `server.mjs`, `dist/`) e as variáveis obrigatórias. `public/logo-adr.png` é o emblema usado por `index.html` (favicon/og:image) e pelos componentes `Logo`/`EmblemPanel` — o arquivo precisa existir no build.
