

# Atualizar Guia de Projeto com estado real da implementacao

## Discrepancias identificadas

### 1. ImplementacaoTab — Edge Functions desatualizadas (linha 71-92)
**Guia lista:** `ai-chat`, `ai-usage`, `audit-prompt`, `process-document` (nao existem)
**Faltam:** `simulate-agent`, `resolve-conversation`, `send-human-reply`, `transfer-conversation`, `embed-content`
**Real (21 funcoes):** asaas-customer, asaas-subscription, asaas-webhook, check-integration, embed-content, fetch-erp-clients, invite-admin, resolve-conversation, save-erp-config, save-integration, save-whatsapp-config, send-email, send-human-reply, send-whatsapp, simulate-agent, test-erp, test-integration, test-whatsapp-connection, transfer-conversation, whatsapp-webhook

### 2. ImplementacaoTab — Shared modules desatualizados (linha 768-779)
**Guia diz:** 8 modulos
**Real:** 11 modulos. Faltam: `context-builder.ts`, `procedure-runner.ts`, `field-maps.ts`, `response-models.ts`. O `crypto.ts` tambem esta ausente da lista.

### 3. ImplementacaoTab — Referencias a "Lovable Cloud" (varias linhas)
O projeto usa **Supabase externo** (ref: zvxcwwhsjtdliihlvvof). Toda a secao "Configuracao Backend" (linhas 122-183) referencia "Lovable Cloud" incorretamente. Deve dizer "Supabase (projeto externo)".

### 4. ResumoProjetoTab — Resumo Executivo desatualizado (linha 342-346)
Menciona arquitetura "Agent → Flow Links → Flows → Steps → tool_handler via catalogo hardcoded". A arquitetura real e: `agent_templates` → `procedures` (JSONB com triggers/steps) → `procedure-runner.ts` + `context-builder.ts` + `tool-handlers.ts`. Tambem menciona "Lovable Cloud".

### 5. ResumoProjetoTab — Tecnologias (linha 43)
Lista "Lovable Cloud" como backend. Deve ser "Supabase" com nota de projeto externo.

### 6. ImplementacaoTab — Secrets (linha 54-61)
Falta `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_URL` (ja configurados). `ASAAS_API_KEY` e `RESEND_API_KEY` marcados como "a configurar" — verificar se ja estao nos secrets.

## Mudancas por arquivo

### `src/components/guia-projeto/ImplementacaoTab.tsx`
- **Edge Functions:** Atualizar lista para as 20 funcoes reais (sem `_shared/`)
- **Shared modules:** Atualizar para 11 modulos com descricoes corretas incluindo `context-builder.ts`, `procedure-runner.ts`, `field-maps.ts`, `response-models.ts`, `crypto.ts`
- **Backend config:** Trocar "Lovable Cloud" por "Supabase (projeto externo)" com ref `zvxcwwhsjtdliihlvvof`
- **Secrets:** Atualizar lista com os secrets reais configurados

### `src/components/guia-projeto/ResumoProjetoTab.tsx`
- **Tecnologias:** Trocar "Lovable Cloud" por "Supabase (externo)"
- **Resumo Executivo:** Atualizar descricao da arquitetura para refletir o sistema real de procedures JSONB, procedure-runner, context-builder e tool-handlers

Nenhuma migration necessaria — apenas atualizacoes de conteudo estatico em componentes React.

