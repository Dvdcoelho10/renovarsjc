# Site da Igreja Assembleia de Deus Renovar

Site institucional (React 19 + TypeScript + Vite, servidor Node próprio) da Assembleia de Deus
Renovar — São José dos Campos, SP.

## Desenvolvimento

```bash
pnpm install
pnpm dev          # http://localhost:8080
```

O Vite também serve as rotas de API em desenvolvimento, lendo as variáveis do `.env`
(copie `.env.example` para `.env` e preencha).

## Produção

```bash
pnpm build        # gera dist/
pnpm start        # node server.mjs (PORT do ambiente, host 0.0.0.0)
```

O servidor entrega o build do React com fallback para o React Router e expõe:

- `GET /api/youtube/latest` — vídeo mais recente do canal (chave só no servidor);
- `POST /api/contact` — envia o formulário de contato pelo SMTP da Hostinger.

Configuração completa da Hostinger, variáveis de ambiente e diagnóstico: **[DEPLOY.md](./DEPLOY.md)**.

## Conteúdo

Textos, imagens e páginas são editados em `/admins` (painel próprio, fora do menu público).
O conteúdo editado fica salvo no navegador até o MySQL ser conectado.
