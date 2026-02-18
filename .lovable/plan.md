
# Simplificar Arquitetura IA: Catalogo Hardcoded + Fluxos por Agente

## Resumo

Eliminar a camada de Procedimentos. Tools passam a ser um catalogo hardcoded no codigo (read-only na UI). Fluxos encapsulam tools nas etapas e sao vinculados diretamente a agentes. A IA valida dados em 3 camadas: instrucao do fluxo, schema da tool, e handler no backend.

## Arquitetura

```text
ATUAL:  Agent -> Procedures -> (Tools + Flows) -> Steps -> tool_id (UUID do DB)
NOVO:   Agent -> Flows -> Steps -> tool_handler (string do catalogo hardcoded)
```

## Camadas de Validacao (sem mapeamento manual)

```text
Camada 1 - Fluxo conversacional:
  Instrucao da etapa diz "Peca o CPF do cliente antes de buscar"
  -> IA pede o dado ao usuario

Camada 2 - JSON Schema (catalogo):
  parameters_schema define { busca: { type: "string", minLength: 2 } } como required
  -> OpenAI so chama a tool quando tem o parametro

Camada 3 - Handler (codigo):
  if (!query || query.length < 2) return { success: false, error: "..." }
  -> Se algo escapar, o handler rejeita e a IA reformula
```

A IA decide quais dados passar, mas o sistema garante que estejam validos antes da execucao.

## O Que Muda

### 1. Tool Catalog (hardcoded, read-only)

Novo arquivo `supabase/functions/_shared/tool-catalog.ts`:

- Interface `ToolDefinition` com: handler, display_name, description, parameters_schema (JSON Schema completo com validacoes), response_description, requires_erp
- Constante `TOOL_CATALOG` com as 3 tools atuais (erp_search, erp_invoice_search, onu_diagnostics)
- Funcao `getAvailableTools(hasErp: boolean)` filtra tools que requerem ERP
- Funcao `buildOpenAITools(hasErp: boolean)` retorna array formatado para a API OpenAI
- Schema de cada tool inclui `required` e `minLength` para validacao automatica pela OpenAI

Espelho frontend em `src/constants/tool-catalog.ts` (mesmos metadados, sem logica de handler) para a pagina admin read-only.

### 2. Fluxos vinculados diretamente ao Agente

- `ai_agent_flows.agent_id` se torna nullable (fluxos passam a ser globais, sem dono)
- Nova tabela `ai_agent_flow_links` (agent_id, flow_id, is_active, sort_order) -- relacao M:N entre agentes e fluxos
- RLS: super_admin ALL, authenticated SELECT

### 3. Steps referenciam tools pelo handler_type

- Nova coluna `tool_handler` (text, nullable) em `ai_agent_flow_steps`
- Migracao de dados: copiar `handler_type` de `ai_agent_tools` para `tool_handler` dos steps existentes
- `tool_id` mantido temporariamente como nullable para retrocompatibilidade

### 4. Camada de Procedimentos depreciada

Tabelas que deixam de ser usadas (nao deletadas imediatamente):
- `ai_procedures`
- `ai_procedure_tools`
- `ai_procedure_flows`
- `ai_agent_procedures`
- `ai_agent_tools` (metadados migrados para catalogo hardcoded)

## Arquivos

### Criados (4)

| Arquivo | Descricao |
|---------|-----------|
| `supabase/functions/_shared/tool-catalog.ts` | Catalogo hardcoded com metadados, schemas e funcao buildOpenAITools |
| `src/constants/tool-catalog.ts` | Espelho frontend do catalogo (display_name, description, params, response) |
| `src/pages/admin/AiToolCatalog.tsx` | Pagina read-only com cards das ferramentas disponiveis |
| `src/components/admin/ai-agents/AgentFlowLinksTab.tsx` | Aba no template do agente: checkboxes para vincular fluxos globais |

### Editados (8)

| Arquivo | Mudanca |
|---------|---------|
| `supabase/functions/ai-chat/index.ts` | Remover bloco de procedures (linhas 513-619). Buscar flows via `ai_agent_flow_links`. Resolver tools do catalogo hardcoded. Reduz de ~8 para ~3 queries. |
| `supabase/functions/_shared/tool-handlers.ts` | Importar catalogo. Sem mudancas nos handlers, apenas adicionar funcao utilitaria para resolver tool_handler -> handler. |
| `src/components/admin/ai-agents/GlobalFlowStepsEditor.tsx` | Dropdown de tools carrega do catalogo frontend em vez de DB. Salva `tool_handler` (string) em vez de `tool_id` (UUID). |
| `src/components/admin/ai-agents/AgentTemplateForm.tsx` | Substituir aba "Procedimentos" por aba "Fluxos" usando AgentFlowLinksTab. |
| `src/components/admin/AdminSidebar.tsx` | Menu IA: remover "Procedimentos", adicionar "Ferramentas" (catalogo read-only). |
| `src/App.tsx` | Remover rotas de procedures. Adicionar rota `/admin/ai-tools`. |
| `src/hooks/admin/useAgentFlows.ts` | Adicionar hooks `useAgentFlowLinks` e `useToggleAgentFlow` para a tabela junction. |
| `src/hooks/admin/useGlobalFlows.ts` | Ajustar query: flows sem filtro de agent_id (ja globais). |

### Removidos (6)

| Arquivo | Motivo |
|---------|--------|
| `src/pages/admin/AiProcedures.tsx` | Camada eliminada |
| `src/pages/admin/AiProcedureDetail.tsx` | Camada eliminada |
| `src/hooks/admin/useAiProcedures.ts` | Camada eliminada |
| `src/hooks/admin/useGlobalTools.ts` | Substituido por catalogo hardcoded |
| `src/components/admin/ai-agents/AgentToolsTab.tsx` | Substituido por catalogo read-only |
| `src/components/admin/ai-agents/AgentToolForm.tsx` | Substituido por catalogo read-only |

## Migracao de Banco de Dados

```text
-- 1. Flows passam a ser globais
ALTER TABLE ai_agent_flows ALTER COLUMN agent_id DROP NOT NULL;

-- 2. Tabela junction Agent <-> Flow (M:N)
CREATE TABLE ai_agent_flow_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  flow_id uuid NOT NULL REFERENCES ai_agent_flows(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agent_id, flow_id)
);
ALTER TABLE ai_agent_flow_links ENABLE ROW LEVEL SECURITY;
-- RLS policies: super_admin ALL, authenticated SELECT

-- 3. Steps referenciam tools pelo handler_type
ALTER TABLE ai_agent_flow_steps ADD COLUMN tool_handler text;

-- 4. Migrar dados existentes: tool_id -> tool_handler
UPDATE ai_agent_flow_steps fs
SET tool_handler = t.handler_type
FROM ai_agent_tools t
WHERE fs.tool_id = t.id AND fs.tool_id IS NOT NULL;

-- 5. Migrar vinculos existentes: procedures -> flow_links
INSERT INTO ai_agent_flow_links (agent_id, flow_id)
SELECT DISTINCT ap.agent_id, pf.flow_id
FROM ai_agent_procedures ap
JOIN ai_procedure_flows pf ON pf.procedure_id = ap.procedure_id
WHERE ap.is_active = true
ON CONFLICT DO NOTHING;
```

## Fluxo Runtime (ai-chat simplificado)

```text
1. Buscar flow_links por agent_id (1 query)
2. Buscar flows + steps por flow_ids (2 queries)
3. Resolver tools do catalogo hardcoded (0 queries, import direto)
4. Verificar ERP se alguma tool requer (1 query condicional)
Total: 3-4 queries vs 8 atuais
```

## Exemplo Completo: Fluxo "Diagnostico de Conexao"

```text
Fluxo: Diagnostico de Conexao (roteiro fixo)
Trigger: "sinal", "conexao", "lento", "caindo"

Etapa 1: Identificar Cliente
  Instrucao: "Peca o CPF ou nome do cliente"
  Input esperado: CPF ou nome
  Tool: (nenhuma)
  Avancar quando: usuario informar CPF ou nome

Etapa 2: Buscar no ERP
  Instrucao: "Busque o cliente no ERP com os dados fornecidos"
  Tool: erp_search  <-- tool_handler (string)
  Avancar quando: cliente encontrado

Etapa 3: Diagnosticar Sinal
  Instrucao: "Execute o diagnostico de sinal ONU do cliente encontrado"
  Tool: onu_diagnostics  <-- tool_handler (string)
  Avancar quando: resultado do diagnostico disponivel

Etapa 4: Relatorio
  Instrucao: "Apresente o resultado ao usuario de forma clara"
  Tool: (nenhuma)
```

Validacao em acao neste fluxo:
- Etapa 1: a instrucao do fluxo faz a IA pedir o CPF (camada 1)
- Etapa 2: o schema de erp_search exige `busca` com minLength 2 (camada 2)
- Etapa 2: o handler valida `query.length < 2` (camada 3)

## Ordem de Implementacao

1. Migracao DB (junction table, nova coluna, migrar dados)
2. Criar `tool-catalog.ts` (backend) e `tool-catalog.ts` (frontend)
3. Atualizar `ai-chat/index.ts` (remover procedures, usar flow_links + catalogo)
4. Atualizar `tool-handlers.ts` (importar catalogo)
5. Deploy edge functions
6. Criar pagina `AiToolCatalog.tsx` (read-only)
7. Criar `AgentFlowLinksTab.tsx` (checkboxes de fluxos por agente)
8. Atualizar `GlobalFlowStepsEditor` (catalogo em vez de DB)
9. Atualizar `AgentTemplateForm` (aba Fluxos)
10. Atualizar sidebar e rotas
11. Remover arquivos obsoletos
