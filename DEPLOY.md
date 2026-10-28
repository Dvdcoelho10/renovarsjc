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
- responde `/api/youtube/latest`, `/api/contact`, `/api/content`, `/api/media/{id}`,
  `/api/admin/login`, `/api/admin/logout`, `/api/admin/session`, `/api/admin/content` e
  `/api/admin/media`;
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

### Banco de dados (MySQL/MariaDB)

| Variável | Exemplo |
| --- | --- |
| `DB_HOST` | `localhost` (na Hostinger, o host que aparece no hPanel) |
| `DB_PORT` | `3306` |
| `DB_NAME` | nome do banco criado no hPanel |
| `DB_USER` | usuário do banco |
| `DB_PASSWORD` | senha do banco |

Sem `DB_HOST`, `DB_NAME` e `DB_USER`, o site continua no ar com o conteúdo padrão, o painel
não autentica e as rotas administrativas respondem `503 db_not_configured`.

Depois de alterar variáveis, **reinicie a aplicação** no hPanel.

## 3.1 Banco de dados e primeiro administrador

1. hPanel → **Bancos de dados → MySQL**: crie o banco e o usuário, e guarde host, nome,
   usuário e senha. Anote também a versão (MySQL 8 ou MariaDB 10.x).
2. hPanel → **phpMyAdmin**: selecione o banco e execute, na ordem, os arquivos de
   `database/migrations/`:
   - `001_admin_content_media.sql` — cria `schema_migrations`, `site_content`,
     `admin_users`, `admin_sessions`, `login_attempts` e `media`.
   As migrações são **idempotentes e não destrutivas** (só `CREATE TABLE IF NOT EXISTS` e
   `INSERT ... ON DUPLICATE KEY UPDATE`). Nenhuma migração roda automaticamente no build.
3. Preencha `DB_*` nas variáveis de ambiente da aplicação.
4. Crie o administrador (a senha é escolhida por você, com no mínimo 12 caracteres):

```bash
ADMIN_EMAIL=contato@adrenovar.com.br ADMIN_PASSWORD='sua-senha-longa' pnpm admin:create
```

   Para redefinir depois: `ADMIN_RESET=1` com as mesmas variáveis. O script grava apenas o
   hash scrypt e encerra as sessões antigas; a senha nunca aparece em log.

5. Acesse `/admins` e entre com esse e-mail e senha. A sessão é um cookie `HttpOnly`,
   `SameSite=Strict` (e `Secure` quando o site está em HTTPS), válido por 8 horas.

Rotas de autenticação: `POST /api/admin/login`, `POST /api/admin/logout`,
`GET /api/admin/session`. Elas recusam requisições de outra origem (CSRF) e, após 5 falhas
por e-mail/IP em 15 minutos, respondem `429 rate_limited`.

## 3.2 Conteúdo, imagens e migração

- **Conteúdo:** `GET /api/content` é público (cache de 15 s) e `PUT /api/admin/content` grava
  o JSON do painel em `site_content` (linha `id = 1`). O visitante vê a alteração assim que o
  admin recebe o “Conteúdo publicado”.
- **Imagens:** o painel otimiza a foto no navegador (WebP) e envia para
  `POST /api/admin/media`; o arquivo vai para a tabela `media` (LONGBLOB, até 3 MB, apenas
  WebP/PNG/JPEG conferidos pelos bytes iniciais) e o conteúdo guarda `/api/media/{id}`. Assim
  nada depende de `dist/` nem do disco do app, que é recriado a cada deploy.
- **Migração do conteúdo antigo:** navegadores que já usaram o painel antigo têm uma cópia em
  `localStorage`. O painel mostra o card “Conteúdo antigo guardado neste navegador”; o envio é
  manual, sobrescreve o banco com esse conteúdo e a cópia local só é apagada depois do `200`.
- **Diagnóstico rápido:** `pnpm check:setup` lista banco, tabelas, administradores, conteúdo
  publicado, SMTP, YouTube e `dist/` sem exibir segredos nem alterar nada.

## 4. Verificação após o deploy

1. `GET /` → página inicial carrega com logo, fontes e imagens.
2. Navegar em `/sobre`, `/agenda`, `/mensagens`, `/contato` e recarregar cada página (F5).
3. `GET /api/youtube/latest` → JSON com `videoId` (ou erro controlado se a chave faltar).
4. Enviar o formulário em `/contato` → deve aparecer “Mensagem enviada!” e o e-mail chegar em
   `contato@adrenovar.com.br` (confira também a caixa de spam no primeiro envio).
5. `/admins` → login com o administrador criado no passo 3.1; editar um texto e salvar.
6. Abrir o site em **outro navegador (ou janela anônima)** e conferir que a alteração aparece.
7. Reiniciar a aplicação e confirmar que o conteúdo continua publicado (persistência no banco).
8. Enviar uma imagem no painel (aba Identidade ou “foto de abertura”) e verificar que ela
   carrega no site por `/api/media/{id}`.
9. Sair do painel e tentar abrir `/admins` de novo (deve pedir login).

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
| `/admins` diz “banco não configurado” | `DB_*` ausentes ou Incorretos — rode `pnpm check:setup` |
| Login responde 401 sempre | senha errada ou administrador não criado (`pnpm admin:create`) |
| “Muitas tentativas” (429) | 5 falhas por e-mail/IP em 15 min: aguarde ou redefina a senha com `ADMIN_RESET=1` |
| Salvar conteúdo dá 403 `invalid_origin` | acesso por domínio diferente do host configurado (proxy/CDN): use o domínio oficial |
| Imagem não envia | sessão expirada, arquivo acima de 3 MB ou banco sem a tabela `media` |

## 6. Imagens institucionais

- `public/logo-adr.png` — emblema usado na logo, favicon e `og:image`.
  O arquivo atual é a arte enviada pela igreja; vale substituir por uma versão otimizada
  (WebP, ~512 px) para reduzir o peso da primeira visita.
- `public/pix-qrcode.png` — QR Code Pix de dízimos e ofertas.
- Fotos de páginas são enviadas pelo painel, otimizadas em WebP no navegador e guardadas na
  tabela `media` do banco — valem para todos os visitantes e sobrevivem a redeploys.
