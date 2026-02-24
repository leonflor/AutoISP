

# Conformidade de Tools: Discrepancias Encontradas

## Diagnostico Completo

Analisei 4 camadas onde tools sao referenciadas: backend (catalog + handlers), frontend (catalog + UI), banco de dados (tabelas), e fluxos (per-agent e global). Encontrei **3 discrepancias estruturais** e **2 inconsistencias de dados**.

---

## Discrepancia 1: Dois sistemas paralelos para referenciar tools nos fluxos

**Problema critico.** Existem dois editores de etapas de fluxo que usam mecanismos diferentes para vincular tools:

| Editor | Usado em | Fonte de tools | Campo salvo no DB |
|---|---|---|---|
| `AgentFlowStepsEditor` | Fluxos per-agent (aba Fluxos do agente) | Tabela `ai_agent_tools` (UUID via `tool_id`) | `tool_id` (UUID) |
| `GlobalFlowStepsEditor` | Fluxos globais | Hardcoded `TOOL_CATALOG` (string via `tool_handler`) | `tool_handler` (string) |

**O backend (`ai-chat`) so le `tool_handler` (string).** O campo `tool_id` e completamente ignorado na hora de montar o prompt e executar tools. Isso significa que qualquer tool selecionada via `AgentFlowStepsEditor` usando `tool_id` **nao funciona** a menos que `tool_handler` tambem esteja preenchido.

**Evidencia no banco:** Os steps existentes tem `tool_id` preenchido E `tool_handler` preenchido (provavelmente salvos manualmente), mas o editor `AgentFlowStepsEditor` so salva `tool_id`, nao `tool_handler`.

**Correcao:** Unificar `AgentFlowStepsEditor` para usar `TOOL_CATALOG` com `tool_handler` (string), igual ao `GlobalFlowStepsEditor`. Remover dependencia de `useAgentTools` e da tabela `ai_agent_tools`.

---

## Discrepancia 2: Tabela `ai_agent_tools` e redundante

A tabela `ai_agent_tools` no banco contem 2 registros:
- `erp_search` (handler_type: "erp_search")
- `erp_invoice_search` (handler_type: "erp_invoice_search")

Esses registros sao copias manuais do que ja existe no hardcoded `TOOL_CATALOG`. O backend **nunca consulta** essa tabela — ele usa exclusivamente o catalogo hardcoded. A tabela so e usada pelo frontend `AgentFlowsTab` → `useAgentTools(agentId)` para popular o dropdown de tools no `AgentFlowStepsEditor`.

Alem disso, `onu_diagnostics` existe no catalogo hardcoded mas **nao existe** na tabela `ai_agent_tools`, criando uma inconsistencia: fluxos globais podem usar `onu_diagnostics`, fluxos per-agent nao.

**Correcao:** Eliminar uso da tabela `ai_agent_tools` no frontend. O `AgentFlowStepsEditor` deve usar `TOOL_CATALOG` diretamente.

---

## Discrepancia 3: Documentacao do guia desatualizada

Em `OpenAIIntegration.tsx` (linha 306), ha uma descricao que menciona uma arquitetura antiga:

> "tools sao registradas em `ai_agent_tools`, agrupadas em `ai_procedures` via `ai_procedure_tools`, e vinculadas a agentes via `ai_agent_procedures`"

Essa arquitetura de "Procedures" **nao existe mais**. As tabelas `ai_procedures`, `ai_procedure_tools`, `ai_agent_procedures` foram substituidas pelo sistema de fluxos (`ai_agent_flows` + `ai_agent_flow_steps`) com catalogo hardcoded.

---

## Plano de Correcao

### Arquivo 1: `src/components/admin/ai-agents/AgentFlowStepsEditor.tsx`

Substituir o sistema de `tool_id` (UUID da tabela) por `tool_handler` (string do catalogo):
- Remover import de `AgentTool` do `useAgentTools`
- Importar `TOOL_CATALOG` de `@/constants/tool-catalog`
- Mudar o campo `StepDraft.tool_id` para `StepDraft.tool_handler`
- Mudar o dropdown para listar `TOOL_CATALOG` em vez de `tools` prop
- No `handleSave`, enviar `tool_handler` em vez de `tool_id`
- Remover prop `tools` da interface

### Arquivo 2: `src/components/admin/ai-agents/AgentFlowsTab.tsx`

- Remover import e uso de `useAgentTools`
- Remover prop `tools` do `AgentFlowStepsEditor`

### Arquivo 3: `src/components/guia-projeto/integracoes/OpenAIIntegration.tsx`

- Atualizar a descricao na linha ~306 para refletir a arquitetura atual: tools vem do catalogo hardcoded (`tool-catalog.ts`), sao vinculadas a etapas de fluxos (`ai_agent_flow_steps.tool_handler`), e fluxos sao conectados a agentes via `ai_agent_flow_links`

### Nao alterar (por ora):
- Tabela `ai_agent_tools` no banco — manter para nao quebrar queries existentes; pode ser removida em limpeza futura
- Hook `useAgentTools.ts` — manter arquivo mas sem uso ativo (dead code)

## Resumo de Impacto

| Arquivo | Mudanca |
|---|---|
| `AgentFlowStepsEditor.tsx` | Trocar `tool_id`/`AgentTool` por `tool_handler`/`TOOL_CATALOG` |
| `AgentFlowsTab.tsx` | Remover `useAgentTools`, remover prop `tools` |
| `OpenAIIntegration.tsx` | Corrigir descricao da arquitetura de tools |

