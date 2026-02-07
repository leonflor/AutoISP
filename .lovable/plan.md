
# Remover campo "Ordem de Exibicao" dos agentes de IA e ordenar por nome

O campo `sort_order` sera removido do formulario de agentes de IA. A ordenacao passara a ser alfabetica pelo nome do agente em todos os locais onde `sort_order` era usado para ordenar templates de agentes.

## Alteracoes

### 1. `src/components/admin/ai-agents/AgentTemplateForm.tsx`
- Remover `sort_order` do schema Zod
- Remover `sort_order: 0` dos valores default
- Remover `sort_order` do reset com dados do agente
- Remover o bloco `FormField` do campo "Ordem de Exibicao" (input numerico na aba Basico)

### 2. `src/hooks/admin/useAiAgentTemplates.ts`
- Linha 82: remover `.order('sort_order', { ascending: true })`
- Manter apenas `.order('name', { ascending: true })` que ja existe na linha 83

### 3. `src/hooks/painel/useIspAgents.ts`
- Linha 90: trocar `.order("sort_order")` por `.order("name", { ascending: true })`

Nota: o campo `sort_order` continuara existindo na tabela do banco -- apenas as referencias no frontend serao removidas. Tabelas como `ai_security_clauses` e `agent_knowledge_base` que tambem usam `sort_order` nao serao afetadas.
