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

# Painel administrativo (/admins)

- Rota `/admins`, fora do menu público. Login em `src/lib/admin-auth.ts` (credenciais definidas pela igreja) e sessão em `sessionStorage`.
- O painel edita: dados da igreja, textos do Início e Sobre, áreas, contato/redes/endereço, destaques, agenda, mensagens, imagens (logo, fotos por página, eventos e mensagens) e o vídeo do YouTube.
- Imagens: `ImageField` aceita upload do computador (otimizado para WebP via `src/lib/image.ts` e salvo como data URL) ou URL. O mesmo campo troca e remove.
- Último vídeo do YouTube: a seção usa a rota de servidor `GET /api/youtube/latest` (`server/youtube.mjs`, servida pelo middleware do `vite.config.ts` em dev e por `server.mjs` em produção). `content.youtube` guarda apenas `enabled`, título e descrição. Canal e chave (`YOUTUBE_CHANNEL_ID`, `YOUTUBE_API_KEY`) ficam somente no `.env`/variáveis da Hostinger, nunca no bundle do cliente. A rota consulta `playlistItems` da playlist de uploads (1 unidade de cota, cache de 60 s no servidor) e `src/lib/youtube.ts` mantém cache de 2 min no navegador, reconsultando a cada 2 min e ao voltar para a aba. `LatestVideoSection` incorpora o player na página inicial, sempre com o vídeo mais recente e sem link que leve para fora do site.
- O servidor existe apenas para a rota do YouTube. O conteúdo do painel e o login continuam em `localStorage` (~5 MB), por navegador; imagens grandes podem estourar a cota e `save()` retorna `false`. Não prometer publicação para todos os visitantes até conectar um banco e mover autenticação + conteúdo para o servidor.

# Servidor e hospedagem

- `npm run build` gera `dist/`; `npm start` (`node server.mjs`) serve o build e `/api/youtube/latest`. Requer runtime Node.js (Hostinger VPS/Cloud). Hospedagem apenas estática/PHP não executa a API.
- Segredos somente em `.env` (ignorado pelo git) ou nas variáveis de ambiente da Hostinger. Nunca usar prefixo `VITE_` em segredos — esse prefixo injeta o valor no bundle do cliente.
- Banco oficial: MySQL na Hostinger (phpMyAdmin), schema em `database/schema.sql`. Credenciais (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) ficam exclusivamente no `.env` ou nas variáveis da Hostinger e são lidas apenas por código de servidor. Nunca em `src/`, nunca no cliente e nunca com prefixo `VITE_`. Não usar Neon/Supabase.
- Rodapé: crédito "Desenvolvido por Nusaas" (substituiu a nota sobre o estatuto).
