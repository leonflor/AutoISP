

# Criar tabelas de Procedimentos + Seed "Cobranca e Financeiro"

## O que sera feito

1. Criar as 4 tabelas necessarias para o sistema de procedimentos
2. Inserir o procedimento de exemplo "Cobranca e Financeiro" com todos os vinculos
3. Criar arquivo de documentacao SQL para referencia

## Tabelas a criar

| Tabela | Funcao |
|---|---|
| ai_procedures | Catalogo de procedimentos reutilizaveis |
| ai_procedure_tools | Vincula ferramentas a procedimentos |
| ai_procedure_flows | Vincula fluxos a procedimentos |
| ai_agent_procedures | Vincula procedimentos a agentes |

Todas com RLS habilitado (leitura para autenticados, gestao para super_admin) e triggers de updated_at.

## Seed de exemplo

**Procedimento:** Cobranca e Financeiro (slug: `cobranca-financeiro`, icone: `receipt`)

**Descricao:** Procedimento completo para identificacao de clientes, consulta de faturas em aberto e negociacao de debitos.

**Vinculos:**
- 2 ferramentas: `buscar_contrato_cliente` + `consultar_faturas`
- 1 fluxo: `Cobranca` (5 etapas)
- 2 agentes: `Atendente Virtual` + `Financeiro`

## Arquivo de documentacao

Criar `docs/migrations/f4-procedure-seed.sql` com o SQL completo.

## Secao tecnica

**Migration SQL:**

```text
-- Tabelas
CREATE TABLE IF NOT EXISTS ai_procedures (id uuid PK, name, slug UNIQUE, description, icon, is_active, sort_order, created_at, updated_at)
CREATE TABLE IF NOT EXISTS ai_procedure_tools (id uuid PK, procedure_id FK, tool_id FK, sort_order, UNIQUE(procedure_id, tool_id))
CREATE TABLE IF NOT EXISTS ai_procedure_flows (id uuid PK, procedure_id FK, flow_id FK, sort_order, UNIQUE(procedure_id, flow_id))
CREATE TABLE IF NOT EXISTS ai_agent_procedures (id uuid PK, agent_id FK, procedure_id FK, is_active, sort_order, UNIQUE(agent_id, procedure_id))

-- RLS + policies (authenticated read, super_admin ALL)
-- Trigger handle_updated_at em ai_procedures

-- Seed com ON CONFLICT DO NOTHING
INSERT INTO ai_procedures VALUES ('Cobranca e Financeiro', 'cobranca-financeiro', ...)
INSERT INTO ai_procedure_tools -- 2 tools
INSERT INTO ai_procedure_flows -- 1 flow
INSERT INTO ai_agent_procedures -- 2 agents
```

**Arquivos:**

| Arquivo | Acao |
|---|---|
| Migration SQL (via Supabase) | Criar tabelas + RLS + seed |
| `docs/migrations/f4-procedure-seed.sql` | Criar arquivo de referencia |
