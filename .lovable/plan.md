

# Plano: Criar tabelas do sistema de Agentes de IA

## Decisoes aplicadas

| Conflito | Resolucao |
|----------|-----------|
| `tenants` | Nao criar. Usar `isps` como tenant — `tenant_id` vira `isp_id` |
| `tenant_erp_config` | Nao criar. Reutilizar `erp_configs` existente |
| WhatsApp em `tenant_agents` | Remover campos WhatsApp. Reutilizar `whatsapp_configs` |
| `conversations` existente | DROP CASCADE e recriar com novo schema |
| `human_agents.user_id` FK | Referenciar `profiles(id)` em vez de `auth.users(id)` |

## Tabelas a criar (1 migration SQL)

| # | Tabela | FK principal | RLS |
|---|--------|-------------|-----|
| 1 | `agent_templates` | — | Somente service_role escreve; authenticated le |
| 2 | `tenant_agents` | `isp_id → isps(id)`, `template_id → agent_templates(id)` | ISP member le, ISP admin escreve |
| 3 | `procedures` | `template_id → agent_templates(id)` | Somente service_role escreve; authenticated le |
| 4 | `conversations` (DROP+recreate) | `isp_id → isps(id)`, `tenant_agent_id → tenant_agents(id)`, `active_procedure_id → procedures(id)` | Isolado por isp_id |
| 5 | `messages` | `conversation_id → conversations(id)` | Isolado por tenant via JOIN conversation |
| 6 | `human_agents` | `isp_id → isps(id)`, `user_id → profiles(id)` | Isolado por isp_id |
| 7 | `quick_replies` | `template_id → agent_templates(id)`, `isp_id → isps(id)` | Template-level: authenticated le; ISP-level: isolado |
| 8 | `knowledge_bases` | `tenant_agent_id → tenant_agents(id)` | Isolado por isp_id via JOIN |

## Impacto em codigo existente

A tabela `conversations` atual e usada por hooks do painel. Ao dropar, estes arquivos quebrarao e precisarao ser atualizados na proxima fase:
- `src/hooks/painel/useCommunications.ts`
- `src/pages/painel/Communication.tsx`

## Extensoes

- `CREATE EXTENSION IF NOT EXISTS vector` (para embeddings)

## Indices

- `conversations(isp_id, mode) WHERE mode = 'human'`
- `conversations(user_phone, tenant_agent_id)`
- `messages(conversation_id, created_at)`
- `knowledge_bases` — ivfflat em `embedding` (criado apos ter >= 1000 rows, senao usa btree placeholder)

## RLS — Funcoes helper reutilizadas

Reutilizar `is_isp_member()`, `is_isp_admin()`, `has_role()` existentes. Para `messages` (que nao tem `isp_id` direto), criar funcao `get_conversation_isp_id(conversation_id)` SECURITY DEFINER.

## Constraint especial

`procedures`: UNIQUE parcial `(template_id, name) WHERE is_current = true`

## Arquivos alterados

- **1 nova migration SQL** com DROP conversations + CREATE de 8 tabelas + extensao vector + indices + RLS policies + helper function

