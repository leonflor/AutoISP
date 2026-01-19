# Guia de Deploy - ISP Manager

Este documento descreve como fazer deploy do ISP Manager em diferentes plataformas.

## Índice

- [Pré-requisitos](#pré-requisitos)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Deploy no Vercel](#deploy-no-vercel)
- [Deploy no Netlify](#deploy-no-netlify)
- [Deploy com Docker](#deploy-com-docker)
- [Configuração do Supabase](#configuração-do-supabase)
- [Checklist de Deploy](#checklist-de-deploy)

---

## Pré-requisitos

- Node.js 18+ e npm/yarn/pnpm
- Conta no Supabase com projeto configurado
- Supabase CLI (para deploy de Edge Functions)

```bash
# Instalar Supabase CLI
npm install -g supabase
```

---

## Variáveis de Ambiente

### Frontend (Vite)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | ✅ | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Chave anônima (pública) do Supabase |
| `VITE_GA_MEASUREMENT_ID` | ❌ | Google Analytics 4 ID |
| `VITE_META_PIXEL_ID` | ❌ | Meta Pixel ID |

> ⚠️ As variáveis `VITE_*` são públicas e seguras para o frontend. A segurança é garantida pelo RLS do Supabase.

### Supabase Secrets (Edge Functions)

Configure via Supabase Dashboard → Settings → Edge Functions → Secrets:

| Secret | Obrigatório | Descrição |
|--------|-------------|-----------|
| `RESEND_API_KEY` | ✅ | API key do Resend para envio de emails |
| `ASAAS_API_KEY` | ✅ | API key do Asaas para pagamentos |
| `ASAAS_WEBHOOK_TOKEN` | ✅ | Token de validação de webhooks Asaas |
| `ASAAS_API_URL` | ❌ | URL da API (default: sandbox) |

> 🔒 Estes secrets NUNCA são expostos no frontend. São acessados apenas pelas Edge Functions via `Deno.env.get()`.

---

## Deploy no Vercel

### 1. Conectar Repositório

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Importe o repositório do GitHub

### 2. Configurar Build

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 3. Adicionar Variáveis de Ambiente

Em Settings → Environment Variables, adicione:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### 4. Deploy

Clique em "Deploy" e aguarde a build completar.

---

## Deploy no Netlify

### 1. Conectar Repositório

1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em "Add new site" → "Import an existing project"
3. Conecte ao GitHub e selecione o repositório

### 2. Configurar Build

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`

### 3. Adicionar Variáveis de Ambiente

Em Site settings → Environment variables, adicione as variáveis `VITE_*`.

### 4. Configurar Redirects

Crie o arquivo `public/_redirects`:

```
/*    /index.html   200
```

---

## Deploy com Docker

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      args:
        VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
        VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY}
    ports:
      - "80:80"
    restart: unless-stopped
```

### Build e Run

```bash
# Build
docker build \
  --build-arg VITE_SUPABASE_URL=https://seu-projeto.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=sua-chave-anon \
  -t isp-manager .

# Run
docker run -p 80:80 isp-manager

# Ou com docker-compose
docker-compose up -d
```

---

## Configuração do Supabase

### 1. Aplicar Migrations

```bash
# Login no Supabase
supabase login

# Linkar ao projeto
supabase link --project-ref seu-project-id

# Aplicar migrations
supabase db push
```

### 2. Deploy de Edge Functions

```bash
# Deploy de todas as functions
supabase functions deploy

# Ou deploy individual
supabase functions deploy ai-chat
supabase functions deploy send-email
supabase functions deploy asaas-webhook
```

### 3. Configurar Secrets

```bash
# Via CLI
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set ASAAS_API_KEY=xxxxx
supabase secrets set ASAAS_WEBHOOK_TOKEN=xxxxx

# Ou via Dashboard
# Supabase Dashboard → Settings → Edge Functions → Secrets
```

---

## Checklist de Deploy

### Pré-Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Migrations aplicadas no Supabase
- [ ] Edge Functions deployadas
- [ ] Secrets configurados no Supabase
- [ ] RLS policies verificadas

### Pós-Deploy

- [ ] Testar login/signup
- [ ] Testar criação de dados
- [ ] Verificar envio de emails
- [ ] Testar integração com Asaas (pagamentos)
- [ ] Verificar logs de Edge Functions

### Monitoramento

- [ ] Configurar alertas no Supabase
- [ ] Ativar logs de erro
- [ ] Configurar analytics (opcional)

---

## Troubleshooting

### Erro: "Supabase credentials not configured"

As variáveis de ambiente não estão definidas. Verifique:
1. Se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão configuradas
2. Se você fez rebuild após adicionar as variáveis (Vite injeta em build time)

### Erro: CORS em Edge Functions

Configure a origem permitida nas Edge Functions ou adicione o domínio de produção.

### Erro: RLS policy violation

Verifique se as políticas RLS estão corretas para o usuário autenticado.

---

## Suporte

Para dúvidas ou problemas, consulte:
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Vite](https://vitejs.dev/guide/)
