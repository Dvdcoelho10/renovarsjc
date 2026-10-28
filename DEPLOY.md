# Implantação na Hostinger — Assembleia de Deus Renovar

Guia técnico da publicação. O site é um app Vite (React 19 + TypeScript) servido por um
servidor Node próprio (`server.mjs`), que também responde as rotas `/api/*`.

## 1. Pré-requisitos

- Hospedagem com **Node.js** (Hostinger "Aplicação Web Node.js", plano VPS/Cloud). Hospedagem
  apenas estática/PHP **não** executa as rotas de API.
- Repositório: `Dvdcoelho10/renovarsjc`, branch `main`.
- Node.js **22.x** e **pnpm** (o repositório tem `pnpm-lock.yaml`).
- Caixa postal `contato@adrenovar.com.br` criada no hPanel → E-mails (para o formulário).

## 2. Configuração no hPanel (Aplicação Web Node.js)

| Campo | Valor |
| --- | --- |
| Tipo de aplicação | Node.js (não "Site estático" / "PHP") |
| Versão do Node.js | 22.x |
| Diretório raiz / do projeto | raiz do repositório (onde está `package.json`) |
| Gerenciador de pacotes | pnpm |
| Comando de instalação | `pnpm install --frozen-lockfile --prod=false` |
| Comando de build | `pnpm build` |
| Diretório de saída | `dist` (servido pelo `server.mjs`; não publique `dist` sozinho) |
| Comando de inicialização | `pnpm start` → executa `node server.mjs` |
| Arquivo de entrada | `server.mjs` |
| Porta | definida pela Hostinger via `process.env.PORT` (fallback 3000) |
| Host | `0.0.0.0` (fixo no código) |

O servidor:

- serve `dist/` com cache longo para `/assets/*` e `no-cache` para HTML;
- devolve `index.html` em rotas desconhecidas (React Router funciona ao recarregar a página);
- responde `/api/youtube/latest` e `/api/contact`;
- aplica cabeçalhos de segurança (`nosniff`, `SAMEORIGIN`, `Referrer-Policy`,
  `Permissions-Policy`, `COOP`);
- bloqueia path traversal fora de `dist/` e métodos diferentes de GET/HEAD na parte estática.

## 3. Variáveis de ambiente (hPanel → Environment Variables)

Nunca use o prefixo `VITE_` — ele publica o valor no bundle do navegador.

### Obrigatórias para o site funcionar por completo

| Variável | Exemplo | Uso |
| --- | --- | --- |
| `SMTP_HOST` | `smtp.hostinger.com` | servidor SMTP do formulário |
| `SMTP_PORT` | `465` (TLS) ou `587` (STARTTLS) | porta SMTP |
| `SMTP_USER` | `contato@adrenovar.com.br` | autenticação e remetente |
| `SMTP_PASSWORD` | senha da caixa postal | **sem ela o formulário responde `mail_not_configured`** |
| `CONTACT_TO_EMAIL` | `contato@adrenovar.com.br` | destino das mensagens |
| `YOUTUBE_CHANNEL_ID` | `UC...` | canal oficial |
| `YOUTUBE_API_KEY` | chave da YouTube Data API v3 | último vídeo |

### Opcionais

| Variável | Padrão | Uso |
| --- | --- | --- |
| `SMTP_FROM_NAME` | `Assembleia de Deus Renovar` | nome exibido no remetente |
| `YOUTUBE_UPLOADS_PLAYLIST_ID` | derivada do canal | força outra playlist |
| `PORT` | definida pela Hostinger | porta HTTP |

### Banco de dados

Nenhuma rota lê `DB_*` hoje. O conteúdo do painel e o login ficam no `localStorage` do
navegador de quem edita. **Não** é necessário criar MySQL para publicar o site; o schema em
`database/schema.sql` está pronto para quando o conteúdo for compartilhado entre visitantes.

Depois de alterar variáveis, **reinicie a aplicação** no hPanel.

## 4. Verificação após o deploy

1. `GET /` → página inicial carrega com logo, fontes e imagens.
2. Navegar em `/sobre`, `/agenda`, `/mensagens`, `/contato` e recarregar cada página (F5).
3. `GET /api/youtube/latest` → JSON com `videoId` (ou erro controlado se a chave faltar).
4. Enviar o formulário em `/contato` → deve aparecer “Mensagem enviada!” e o e-mail chegar em
   `contato@adrenovar.com.br` (confira também a caixa de spam no primeiro envio).
5. `/admins` → login do painel (proteção de navegação; não é autenticação de servidor).

## 5. Diagnóstico rápido

| Sintoma | Causa provável |
| --- | --- |
| “Build não encontrado. Rode `pnpm build`” | build não executado antes do start |
| Site abre, APIs dão 404 | app em modo estático (não Node) ou build publicado sem `server.mjs` |
| `mail_not_configured` no formulário | `SMTP_PASSWORD` ausente nas variáveis |
| `send_failed` no formulário | senha incorreta, caixa postal inexistente ou porta bloqueada (teste 587) |
| E-mail chega marcado como spam | confirme SPF/DKIM do domínio no hPanel (a Hostinger configura ao usar o serviço de e-mail dela) |
| “Não foi possível carregar o vídeo” | `YOUTUBE_API_KEY` inválida, API desativada ou cota esgotada |
| Erro 502/503 no domínio | processo não subiu: confira `PORT`, logs e comando de start |
| Build falha em “vite: not found” | dependências de desenvolvimento não instaladas: use `--prod=false` na instalação |

## 6. Imagens institucionais

- `public/logo-adr.png` — emblema usado na logo, favicon e `og:image`.
  O arquivo atual é a arte enviada pela igreja; vale substituir por uma versão otimizada
  (WebP, ~512 px) para reduzir o peso da primeira visita.
- `public/pix-qrcode.png` — QR Code Pix de dízimos e ofertas.
- Fotos de páginas são enviadas pelo painel (upload otimiza para WebP e salva como data URL
  no `localStorage`, ou seja, vale para aquele navegador até o banco ser conectado).
