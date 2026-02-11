

# Seed: Procedimento "Cobranca e Financeiro"

## Contexto

As tabelas de procedimentos (`ai_procedures`, `ai_procedure_tools`, `ai_procedure_flows`, `ai_agent_procedures`) ainda nao existem no banco. Precisamos cria-las e inserir o seed.

Os recursos existentes foram confirmados:

| Recurso | ID |
|---|---|
| Tool: buscar_contrato_cliente | `fa533441-439f-4f4d-afdb-9f78749ff2de` |
| Tool: consultar_faturas | `26bd11d1-3909-48ad-869c-280ddabc8daf` |
| Flow: Cobranca | `ea447503-8a62-467b-b0de-4fb76822a917` |
| Agent: Atendente Virtual | `599bcd52-350c-47e7-8f96-b919a5e2a8a1` |
| Agent: Financeiro | `8e08ca74-2cd1-4a11-8b62-c8c3e99b422a` |

## Etapas

### 1. Migration -- criar as 4 tabelas

Executar migration SQL com `CREATE TABLE IF NOT EXISTS` para:

- `ai_procedures` (id, name, slug unique, description, icon, is_active, sort_order, created_at, updated_at)
- `ai_procedure_tools` (id, procedure_id FK, tool_id FK, sort_order, unique(procedure_id, tool_id))
- `ai_procedure_flows` (id, procedure_id FK, flow_id FK, sort_order, unique(procedure_id, flow_id))
- `ai_agent_procedures` (id, agent_id FK, procedure_id FK, is_active, sort_order, unique(agent_id, procedure_id))

Incluir trigger `update_updated_at_column` em `ai_procedures` e habilitar RLS com policies para `super_admin`.

### 2. Seed -- inserir dados

Usar INSERT com `ON CONFLICT DO NOTHING` para idempotencia:

1. Inserir procedimento "Cobranca e Financeiro" (slug: `cobranca-financeiro`, icon: `receipt`)
2. Vincular as 2 tools ao procedimento
3. Vincular o flow "Cobranca" ao procedimento
4. Vincular os agents "Atendente Virtual" e "Financeiro"

### 3. Arquivo de documentacao

Criar `docs/migrations/f4-procedure-seed.sql` com o SQL completo para referencia.

## Secao tecnica

**Migration SQL (resumo):**

```text
CREATE TABLE IF NOT EXISTS ai_procedures (...)
CREATE TABLE IF NOT EXISTS ai_procedure_tools (...)
CREATE TABLE IF NOT EXISTS ai_procedure_flows (...)
CREATE TABLE IF NOT EXISTS ai_agent_procedures (...)

-- RLS + policies para super_admin
-- Trigger updated_at

-- Seed inserts com ON CONFLICT DO NOTHING
INSERT INTO ai_procedures (name, slug, ...) VALUES ('Cobranca e Financeiro', 'cobranca-financeiro', ...)
INSERT INTO ai_procedure_tools (procedure_id, tool_id) ...
INSERT INTO ai_procedure_flows (procedure_id, flow_id) ...
INSERT INTO ai_agent_procedures (agent_id, procedure_id) ...
```

**Arquivos a criar/modificar:**

| Arquivo | Acao |
|---|---|
| `docs/migrations/f4-procedure-seed.sql` | Criar -- SQL de referencia |
| Migration via ferramenta Supabase | Executar -- criar tabelas + seed |

