

# Plano: Exclusao completa da implementacao de IA (exceto tools backend)

## O que sera MANTIDO

| Arquivo | Motivo |
|---------|--------|
| `supabase/functions/_shared/tool-catalog.ts` | Catalogo de tools |
| `supabase/functions/_shared/tool-handlers.ts` | Handlers de tools |
| `supabase/functions/_shared/erp-driver.ts` | Driver ERP |
| `supabase/functions/_shared/erp-types.ts` | Tipos ERP |
| `supabase/functions/_shared/field-maps.ts` | Mapeamento campos |
| `supabase/functions/_shared/response-models.ts` | Modelos de resposta |
| `supabase/functions/_shared/erp-providers/*` | Conectores ERP |
| `supabase/functions/_shared/onu-signal-analyzer.ts` | Analise de sinal |
| `src/constants/tool-catalog.ts` | Mirror frontend |
| `src/pages/admin/AiToolCatalog.tsx` | Pagina catalogo visual |

## O que sera EXCLUIDO

### Edge Functions (4 funcoes)
- `supabase/functions/ai-chat/` — chat com IA
- `supabase/functions/ai-usage/` — metricas de uso
- `supabase/functions/audit-prompt/` — auditoria de prompts
- `supabase/functions/process-document/` — processamento RAG

### Shared module
- `supabase/functions/_shared/state-machine.ts`

### Componentes admin (16 arquivos)
- `src/components/admin/ai-agents/*` (14 arquivos: AgentFlowForm, AgentFlowLinksTab, AgentFlowsTab, AgentTemplateForm, AgentTemplateTable, FlowStateEditor, GlobalFlowForm, GlobalFlowStateEditor, LogDetailsDialog, PersonalizationTab, ProcessingLogsTable, PromptAuditDialog, TemplateAvatarUpload, constants)
- `src/components/admin/ai-security/*` (2 arquivos: SecurityClauseForm, SecurityClauseTable)

### Componentes painel (16 arquivos)
- `src/components/painel/ai/*` (todos: ActiveAgentCard, AgentActivationDialog, AgentCatalogCard, AgentConfigDialog, AgentTestDialog, AvatarUpload, BehaviorTab, ChunkSizeConfig, DocumentStatusBadge, DocumentUpload, DocumentsTable, ImageCropperDialog, KnowledgeBaseForm, KnowledgeBaseImport, KnowledgeBaseTable, KnowledgeBaseViewDialog)

### Paginas admin (5 paginas)
- `AiAgents.tsx`, `AiAgentDetail.tsx`, `AiFlows.tsx`, `AiProcessingLogs.tsx`, `AiSecurity.tsx`

### Paginas painel (2 paginas)
- `AiAgents.tsx`, `AiAgentKnowledge.tsx`

### Hooks (12 hooks)
- Admin: `useAgentFlows`, `useAiAgentTemplates`, `useAiSecurityClauses`, `useAuditPrompt`, `useGlobalFlows`, `useProcessingLogs`, `useTemplateIspAgents`
- Painel: `useAgentKnowledge`, `useAiAgents`, `useDocumentKnowledge`, `useIspAgents`, `useIspAiUsage`

### Tabelas (migration DROP — 13 tabelas)
- `document_chunks`, `document_processing_logs`, `knowledge_documents`
- `agent_knowledge_base`
- `conversation_sessions`
- `flow_state_definitions`
- `ai_agent_flow_links`, `ai_agent_flows`
- `ai_limits`, `ai_usage`, `ai_security_clauses`
- `isp_agents`, `ai_agents`
- Tipos enum: `ai_agent_scope`, `ai_agent_type`, `security_clause_applies`
- Funcao: `match_document_chunks`

### Atualizacoes em arquivos existentes

1. **`src/App.tsx`** — remover rotas: `/admin/ai-agents`, `/admin/ai-agents/novo`, `/admin/ai-agents/:id`, `/admin/ai-flows`, `/admin/ai-logs`, `/admin/ai-security`, `/painel/agentes`, `/painel/agentes/:agentId/conhecimento` e seus lazy imports. Manter rota `/admin/ai-tools`.

2. **`src/components/admin/AdminSidebar.tsx`** — reduzir submenu IA para apenas `{ title: 'Ferramentas', url: '/admin/ai-tools', icon: Wrench }`

3. **`src/components/painel/PainelSidebar.tsx`** — remover item "Agentes IA"

4. **`supabase/config.toml`** — remover entradas `[functions.ai-chat]`, `[functions.ai-usage]`, `[functions.audit-prompt]`, `[functions.process-document]` se existirem

## Ordem de execucao

1. Migration SQL (DROP tabelas com CASCADE)
2. Deletar edge functions e state-machine.ts
3. Deletar componentes, paginas, hooks
4. Atualizar App.tsx, AdminSidebar, PainelSidebar

## Total: ~55 arquivos deletados, 3 arquivos editados, 1 migration

