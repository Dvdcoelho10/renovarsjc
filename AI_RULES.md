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
- O painel edita: dados da igreja, textos do Início e Sobre, áreas, contato/redes/endereço, destaques, agenda, mensagens, imagens (logo, fotos por página, eventos e mensagens) e a transmissão do YouTube.
- Imagens: `ImageField` aceita upload do computador (otimizado para WebP via `src/lib/image.ts` e salvo como data URL) ou URL. O mesmo campo troca e remove.
- Transmissão: `content.youtube` aceita ID/link do canal (embed `live_stream?channel=`) ou link de vídeo/live. A seção só aparece quando há player válido.
- Não há servidor/banco conectado: a persistência é `localStorage` (~5 MB). Imagens grandes podem estourar a cota; `save()` retorna `false` e o painel avisa. Não prometer publicação para todos os visitantes até conectar um banco e mover autenticação + conteúdo para o servidor.
