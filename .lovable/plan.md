

# Integracao WhatsApp -- Backend + Frontend (ISP e Admin independentes)

## Principio de Seguranca

As credenciais WhatsApp de cada ISP sao **privadas**. O SaaS Admin nao tem acesso, nao visualiza e nao gerencia a integracao dos ISPs. Admin e ISP possuem integracoes **completamente independentes**.

## O que existe hoje

| Componente | Status |
|-----------|--------|
| `whatsapp_configs` (tabela, per ISP) | Existe |
| `whatsapp-webhook` (Edge Function, recebe msgs) | Existe |
| `conversations` (tabela, historico de chat) | Existe |
| Painel ISP: `/painel/whatsapp` (config credenciais) | Existe |
| Painel ISP: `/painel/comunicacao` (campanhas - mock) | Existe |
| Coluna `settings` em `whatsapp_configs` | **Falta** |
| `whatsapp_messages` (tabela de rastreamento) | **Falta** |
| `send-whatsapp` (Edge Function de envio) | **Falta** |
| ISP: envio de msgs e historico no painel | **Falta** |
| Admin: integracao WhatsApp propria | **Falta** |

## Escopo da Implementacao

### Parte 1: Migration -- Novas tabelas e colunas

**1a. Coluna `settings` em `whatsapp_configs`**
Armazenar `phone_number_id`, `verify_token`, `business_account_id` em JSONB. O frontend ISP ja usa isso via cast `(config as any).settings` -- isso vai resolver o type safety.

**1b. Tabela `whatsapp_messages`**
Rastrear cada mensagem enviada/recebida com status, custo e metadados:

```text
whatsapp_messages
- id (UUID PK)
- isp_id (FK isps, nullable para msgs do admin)
- wamid (TEXT UNIQUE) -- WhatsApp Message ID
- direction (TEXT: inbound/outbound)
- message_type (TEXT: template/text/image/audio/document)
- recipient_phone (TEXT)
- sender_phone (TEXT)
- template_name (TEXT, nullable)
- template_params (JSONB, nullable)
- content (TEXT)
- status (TEXT: pending/sent/delivered/read/failed)
- status_updated_at (TIMESTAMPTZ)
- error_code (TEXT, nullable)
- error_message (TEXT, nullable)
- conversation_id (FK conversations, nullable)
- subscriber_id (FK subscribers, nullable)
- conversation_type (TEXT: authentication/utility/marketing/service)
- cost_usd (DECIMAL(10,4), nullable)
- created_at, sent_at, delivered_at, read_at (TIMESTAMPTZ)
```

**1c. Tabela `admin_whatsapp_config`**
Configuracao WhatsApp exclusiva do SaaS Admin (sem FK para ISP):

```text
admin_whatsapp_config
- id (UUID PK)
- provider (TEXT DEFAULT 'meta')
- api_url (TEXT)
- api_key_encrypted (TEXT)
- encryption_iv (TEXT)
- phone_number (TEXT)
- phone_number_id (TEXT)
- verify_token (TEXT)
- webhook_url (TEXT)
- is_connected (BOOLEAN DEFAULT false)
- connected_at (TIMESTAMPTZ)
- created_at, updated_at (TIMESTAMPTZ)
```

RLS: `whatsapp_messages` isolada por `isp_id` via `isp_members` (para ISPs) e por role `superadmin` (para msgs sem isp_id). `admin_whatsapp_config` acessivel apenas por `superadmin`.

### Parte 2: Edge Function `send-whatsapp`

Funcao unificada para envio de mensagens (ISP e Admin):
- Validacao JWT manual (mesmo padrao das demais)
- Determina contexto: se usuario e superadmin e nao passa `isp_id`, usa `admin_whatsapp_config`; caso contrario, busca config do ISP do usuario
- Decripta access token (AES-256-GCM)
- Envia via WhatsApp Cloud API v18.0
- Registra na tabela `whatsapp_messages`
- Suporta envio de texto livre e template messages

### Parte 3: Atualizar `whatsapp-webhook`

- Registrar msgs inbound na tabela `whatsapp_messages` (alem de `conversations`)
- Registrar msgs outbound (respostas da IA) na tabela `whatsapp_messages`
- Processar status callbacks (delivered, read) e atualizar `whatsapp_messages`

### Parte 4: Painel ISP -- Envio e Historico

Melhorar a pagina existente `/painel/whatsapp`:
- **Aba "Configuracao"**: manter o formulario atual de credenciais
- **Aba "Enviar Mensagem"**: formulario para envio de texto/template para um numero
- **Aba "Historico"**: tabela filtravel de `whatsapp_messages` do ISP (direcao, status, destinatario, data)

Criar hook `useWhatsAppMessages` para queries da tabela `whatsapp_messages`.

### Parte 5: Painel Admin -- Integracao WhatsApp Propria

**Rota:** `/admin/whatsapp`

**Funcionalidades:**
- **Aba "Configuracao"**: formulario para credenciais do WhatsApp do SaaS (usa `admin_whatsapp_config`, mesmo layout do ISP)
- **Aba "Enviar Mensagem"**: envio de texto/template para um numero (usa a mesma Edge Function `send-whatsapp`)
- **Aba "Historico"**: mensagens enviadas/recebidas pelo admin (filtro `isp_id IS NULL`)

Navegacao: adicionar "WhatsApp" no `AdminSidebar`.

## Secao Tecnica

### Arquivos a criar

1. **Migration SQL** -- `whatsapp_messages`, `admin_whatsapp_config`, coluna `settings`
2. **`supabase/functions/send-whatsapp/index.ts`** -- Edge Function de envio
3. **`src/hooks/painel/useWhatsAppMessages.ts`** -- hook para historico ISP
4. **`src/hooks/admin/useAdminWhatsAppConfig.ts`** -- hook para config admin
5. **`src/hooks/admin/useAdminWhatsAppMessages.ts`** -- hook para historico admin
6. **`src/pages/admin/WhatsApp.tsx`** -- pagina admin com tabs
7. **`src/components/painel/whatsapp/SendMessageForm.tsx`** -- formulario de envio reutilizavel
8. **`src/components/painel/whatsapp/MessageHistory.tsx`** -- tabela de historico reutilizavel

### Arquivos a modificar

9. **`src/pages/painel/WhatsAppConfig.tsx`** -- adicionar tabs (Config / Enviar / Historico)
10. **`supabase/functions/whatsapp-webhook/index.ts`** -- registrar msgs na nova tabela
11. **`src/components/admin/AdminSidebar.tsx`** -- adicionar link WhatsApp
12. **`src/App.tsx`** -- adicionar rota `/admin/whatsapp`
13. **`supabase/config.toml`** -- adicionar `[functions.send-whatsapp]`
14. **`src/hooks/painel/useWhatsAppConfig.ts`** -- remover casts `as any` (coluna `settings` existira)

### Ordem de implementacao

1. Migration (DB: tabelas + coluna + RLS)
2. Edge Function `send-whatsapp`
3. Atualizar `whatsapp-webhook` para registrar em `whatsapp_messages`
4. Componentes reutilizaveis (SendMessageForm, MessageHistory)
5. Painel ISP: tabs de envio e historico
6. Painel Admin: pagina completa + sidebar + rota
7. Atualizar hook ISP para remover type casts

### Isolamento de dados

- ISP so ve suas proprias mensagens (`isp_id` filtrado por RLS)
- Admin so ve mensagens do admin (`isp_id IS NULL`)
- Credenciais do ISP sao invisíveis para o admin e vice-versa
- Tabelas separadas para configs: `whatsapp_configs` (ISP) vs `admin_whatsapp_config` (Admin)

