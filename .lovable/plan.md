

# Remover Dead Code: Tabela ai_agent_tools + Hook + Tabelas Procedures Legadas

## Diagnostico

Confirmei que:
- `useAgentTools.ts` nao e importado por nenhum outro arquivo (0 referencias externas)
- A tabela `ai_agent_tools` nao e referenciada por nenhuma edge function
- As tabelas legadas do sistema "Procedures" (`ai_procedures`, `ai_procedure_tools`, `ai_procedure_flows`, `ai_agent_procedures`) tambem nao sao referenciadas por nenhum codigo — sao dead code completo desde a migracao para o sistema de fluxos

## Plano

### 1. Deletar arquivo `src/hooks/admin/useAgentTools.ts`

Hook completamente sem uso apos a unificacao do `AgentFlowStepsEditor` para `TOOL_CATALOG`.

### 2. Migracao SQL — Dropar 5 tabelas obsoletas

Ordem de DROP respeitando foreign keys (tabelas-filhas primeiro):

```sql
-- 1. Tabelas de junção das Procedures (dependem de ai_procedures)
DROP TABLE IF EXISTS ai_procedure_tools;
DROP TABLE IF EXISTS ai_procedure_flows;
DROP TABLE IF EXISTS ai_agent_procedures;

-- 2. Tabela principal Procedures
DROP TABLE IF EXISTS ai_procedures;

-- 3. Tabela ai_agent_tools (dead code — backend usa TOOL_CATALOG hardcoded)
DROP TABLE IF EXISTS ai_agent_tools;
```

Essas 5 tabelas nao possuem dados relevantes e nao sao referenciadas por nenhum codigo no frontend nem no backend.

### 3. Coluna `tool_id` em `ai_agent_flow_steps`

A coluna `tool_id` (UUID, FK para `ai_agent_tools`) ficara orfã apos dropar `ai_agent_tools`. Sera removida na mesma migracao:

```sql
ALTER TABLE ai_agent_flow_steps DROP COLUMN IF EXISTS tool_id;
```

O backend e o frontend ja usam exclusivamente `tool_handler` (string).

### 4. Coluna `agent_id` em `ai_agent_flows`

A coluna `agent_id` na tabela `ai_agent_flows` era do sistema antigo (fluxos per-agent). Agora a vinculacao e feita via `ai_agent_flow_links`. Porem, o `AgentFlowsTab` ainda usa `agent_id` para listar fluxos per-agent. **Nao sera removida** nesta etapa.

## Resumo de Impacto

| Item | Acao |
|---|---|
| `src/hooks/admin/useAgentTools.ts` | **DELETAR** arquivo |
| `ai_procedure_tools` (tabela) | **DROP** |
| `ai_procedure_flows` (tabela) | **DROP** |
| `ai_agent_procedures` (tabela) | **DROP** |
| `ai_procedures` (tabela) | **DROP** |
| `ai_agent_tools` (tabela) | **DROP** |
| `ai_agent_flow_steps.tool_id` (coluna) | **DROP COLUMN** |

