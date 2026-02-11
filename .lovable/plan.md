

# Procedimentos Reutilizaveis para Agentes de IA

## Conceito

Um **Procedimento** e um pacote nomeado que agrupa Ferramentas (Tools) e Fluxos Conversacionais. O Superadmin cria procedimentos no catalogo global e depois os atribui a qualquer agente. O ISP apenas habilita/desabilita o agente -- os procedimentos vinculados funcionam automaticamente.

```text
+---------------------------+
|   Procedimento: Cobranca  |
+---------------------------+
| Tools:                    |
|   - consultar_faturas     |
|   - buscar_contrato       |
| Fluxos:                   |
|   - Fatura em Atraso (5x) |
|   - Segunda Via (3x)      |
+---------------------------+
        |           |
   Agente A     Agente B
  (ativado)    (ativado)
```

## Mudanca no Banco de Dados

### Novas tabelas

| Tabela | Descricao |
|---|---|
| `ai_procedures` | Catalogo de procedimentos (nome, slug, descricao, is_active) |
| `ai_procedure_tools` | Junction: procedimento -> tool |
| `ai_procedure_flows` | Junction: procedimento -> flow |
| `ai_agent_procedures` | Junction: agente -> procedimento (is_active, vinculado pelo admin) |

### Alteracoes em tabelas existentes

| Tabela | Mudanca |
|---|---|
| `ai_agent_tools` | Remover coluna `agent_id` (tools viram globais) |
| `ai_agent_flows` | Remover coluna `agent_id` (flows viram globais) |

### Schema das novas tabelas

```text
ai_procedures
  id          UUID PK
  name        TEXT NOT NULL
  slug        TEXT UNIQUE NOT NULL
  description TEXT
  icon        TEXT (ex: 'receipt', 'headset', 'wifi')
  is_active   BOOLEAN DEFAULT true
  sort_order  INT DEFAULT 0
  created_at  TIMESTAMPTZ
  updated_at  TIMESTAMPTZ

ai_procedure_tools
  id            UUID PK
  procedure_id  UUID FK -> ai_procedures
  tool_id       UUID FK -> ai_agent_tools
  sort_order    INT DEFAULT 0
  UNIQUE(procedure_id, tool_id)

ai_procedure_flows
  id            UUID PK
  procedure_id  UUID FK -> ai_procedures
  flow_id       UUID FK -> ai_agent_flows
  sort_order    INT DEFAULT 0
  UNIQUE(procedure_id, flow_id)

ai_agent_procedures
  id            UUID PK
  agent_id      UUID FK -> ai_agents
  procedure_id  UUID FK -> ai_procedures
  is_active     BOOLEAN DEFAULT true
  sort_order    INT DEFAULT 0
  UNIQUE(agent_id, procedure_id)
```

## Mudanca na Interface Admin

### 1. Nova pagina: Procedimentos (`/admin/ai-procedures`)

Acessivel via sidebar. Lista todos os procedimentos como cards:

```text
+----------------------------------------------+
| Procedimentos de IA           [+ Novo]       |
+----------------------------------------------+
| [icon] Cobranca                    Ativo     |
| 2 tools, 2 fluxos | 3 agentes vinculados    |
+----------------------------------------------+
| [icon] Suporte Tecnico            Ativo     |
| 1 tool, 3 fluxos  | 1 agente vinculado      |
+----------------------------------------------+
```

### 2. Pagina de detalhe do Procedimento (`/admin/ai-procedures/:id`)

Layout com 3 abas:

- **Basico**: nome, slug, descricao, icone, status
- **Ferramentas**: selecionar tools do catalogo global para incluir neste procedimento
- **Fluxos**: selecionar fluxos do catalogo global para incluir neste procedimento

### 3. Catalogo Global de Tools e Fluxos

As abas "Tools" e "Fluxos" dentro do agente serao substituidas por:

- Pagina global de Tools (`/admin/ai-tools`) -- CRUD de todas as ferramentas
- Pagina global de Fluxos (`/admin/ai-flows`) -- CRUD de todos os fluxos + editor de etapas

Ou, para simplificar a navegacao, manter Tools e Fluxos como abas dentro da pagina do Procedimento (ja que tools e fluxos sempre pertencem a um procedimento).

### 4. Aba "Procedimentos" na pagina do Agente

Substituir as abas "Tools" e "Fluxos" por uma unica aba **"Procedimentos"** que mostra checkboxes para ativar/desativar procedimentos para aquele agente:

```text
Aba: Procedimentos
+----------------------------------------------+
| [x] Cobranca          2 tools, 2 fluxos     |
| [x] Suporte Tecnico   1 tool, 3 fluxos      |
| [ ] Vendas Ativas     3 tools, 1 fluxo      |
+----------------------------------------------+
```

## Mudanca no Backend (ai-chat Edge Function)

### Carregar procedimentos em vez de tools/flows diretos

O trecho que hoje faz:

```text
SELECT tools FROM ai_agent_tools WHERE agent_id = X
SELECT flows FROM ai_agent_flows WHERE agent_id = X
```

Passa a fazer:

```text
SELECT tools via:
  ai_agent_procedures (agent_id = X, is_active = true)
  -> ai_procedure_tools -> ai_agent_tools (is_active = true)

SELECT flows via:
  ai_agent_procedures (agent_id = X, is_active = true)
  -> ai_procedure_flows -> ai_agent_flows (is_active = true)
  -> ai_agent_flow_steps
```

O `buildSystemPrompt` continua recebendo os mesmos arrays de tools e flows -- a mudanca e apenas na query de carga.

## Arquivos a criar/modificar

| Arquivo | Acao |
|---|---|
| Migration SQL | Criar tabelas, migrar dados existentes, remover `agent_id` |
| `src/pages/admin/AiProcedures.tsx` | Nova pagina -- lista de procedimentos |
| `src/pages/admin/AiProcedureDetail.tsx` | Nova pagina -- detalhe com abas |
| `src/hooks/admin/useAiProcedures.ts` | Hook CRUD para procedimentos |
| `src/components/admin/ai-procedures/ProcedureForm.tsx` | Formulario basico |
| `src/components/admin/ai-procedures/ProcedureToolsTab.tsx` | Vincular tools |
| `src/components/admin/ai-procedures/ProcedureFlowsTab.tsx` | Vincular fluxos |
| `src/components/admin/ai-agents/AgentProceduresTab.tsx` | Aba no agente para ativar procedimentos |
| `src/components/admin/ai-agents/AgentTemplateForm.tsx` | Substituir abas Tools/Fluxos por Procedimentos |
| `src/components/admin/AdminSidebar.tsx` | Adicionar link "Procedimentos" |
| `src/App.tsx` | Adicionar rotas |
| `supabase/functions/ai-chat/index.ts` | Alterar queries para carregar via procedimentos |
| `src/hooks/admin/useAgentTools.ts` | Remover filtro por `agent_id`, tornar global |
| `src/hooks/admin/useAgentFlows.ts` | Remover filtro por `agent_id`, tornar global |

## Ordem de implementacao sugerida

1. **Migration SQL** -- criar tabelas, migrar dados, ajustar FKs
2. **Hooks e CRUD** -- useAiProcedures, adaptar useAgentTools/useAgentFlows
3. **Paginas Admin** -- AiProcedures, AiProcedureDetail
4. **Aba Procedimentos no Agente** -- AgentProceduresTab
5. **Backend ai-chat** -- alterar queries de carga
6. **Limpeza** -- remover componentes obsoletos (AgentToolsTab, AgentFlowsTab como abas do agente)

