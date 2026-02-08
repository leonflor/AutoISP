

# Atualizar Guia do Projeto com Funcionalidades Implementadas

## Lacunas Identificadas

Apos comparar todo o codigo implementado com a documentacao no Guia, foram encontradas as seguintes lacunas:

---

### 1. Features Admin IA -- Falta documentar Tools, Flows e Logs (IAFeatures.tsx)

O guia documenta apenas 8 features (F-ADMIN-108 a F-ADMIN-115) para o modulo IA. Porem, existem funcionalidades implementadas e nao documentadas:

| Feature | Implementacao | Status no Guia |
|---|---|---|
| CRUD de Tools (ai_agent_tools) | AgentToolsTab, AgentToolForm, useAgentTools | Ausente |
| CRUD de Flows (ai_agent_flows) | AgentFlowsTab, AgentFlowForm, useAgentFlows | Ausente |
| Editor de Etapas (ai_agent_flow_steps) | AgentFlowStepsEditor, useSaveFlowSteps | Ausente |
| Logs de Processamento RAG | AiProcessingLogs, ProcessingLogsTable, LogDetailsDialog | Ausente |
| Aba Personalizacao (VoiceTones, Escalation) | PersonalizationTab, constants.ts | Ausente |

**Plano:** Adicionar features F-ADMIN-116 a F-ADMIN-123 cobrindo:
- F-ADMIN-116: Listar Tools do Agente
- F-ADMIN-117: Criar/Editar Tool
- F-ADMIN-118: Excluir Tool
- F-ADMIN-119: Listar Fluxos Conversacionais
- F-ADMIN-120: Criar/Editar Fluxo
- F-ADMIN-121: Gerenciar Etapas do Fluxo
- F-ADMIN-122: Visualizar Logs de Processamento RAG
- F-ADMIN-123: Configurar Personalizacao do Template (VoiceTones, Escalation)

Tambem corrigir a regra RN-F108-03 que ainda menciona `sort_order` (removido) -- substituir por "Ordenacao alfabetica por nome".

Atualizar o contador de features de 8 para 16 no cabecalho.

---

### 2. Integracao OpenAI -- Atualizar secao Function Calling (OpenAIIntegration.tsx)

A secao "Function Calling (Tools)" lista 6 functions aspiracionais que **nao existem** no codigo:
- `consultar_fatura`, `verificar_conexao`, `abrir_chamado`, `consultar_plano`, `segunda_via_boleto`, `agendar_visita`

O que **realmente existe** implementado:
- `buscar_contrato_cliente` (handler: `erp_search`) -- busca clientes no ERP
- `consultar_faturas` (handler: `erp_invoice_search`) -- lista faturas (mock)

**Plano:**
- Substituir a tabela de functions pela lista real implementada
- Adicionar nota explicativa sobre a arquitetura dinamica (tools carregadas do banco, gerenciaveis pelo admin)
- Documentar o Tool Call Loop (max 3 iteracoes) do `ai-chat`
- Manter as functions aspiracionais em uma secao separada "Roadmap de Tools"

---

### 3. Implementacao Tab -- Atualizar modulos da F5 (ImplementacaoTab.tsx)

A lista de modulos da Fase 5 mostra:
```
Dashboard, Assinantes, Agentes IA, Faturas, Usuarios, Relatorios, Configuracoes
```

Faltam os modulos ja implementados:
- **Comunicacao** (PainelCommunication)
- **WhatsApp** (PainelWhatsApp)
- **Integracoes ERP** (PainelErpIntegrations)
- **Base de Conhecimento** (PainelAgentKnowledge)
- **Atendimentos/Tickets** (PainelTickets)

**Plano:** Atualizar o array de badges da F5 para incluir todos os 12 modulos implementados.

---

### 4. Features Admin IA -- Atualizar contagem no FeaturesAdminSection.tsx

O modulo "IA" aparece com `count: 8`. Sera atualizado para `count: 16` apos adicionar as novas features.

---

### 5. Edge Functions na ImplementacaoTab -- Adicionar `fetch-erp-clients`

A lista de Edge Functions ja contem `fetch-erp-clients` (14 no total). Confirmar que a lista esta correta e documentar os modulos compartilhados (`_shared/tool-handlers.ts`, `_shared/erp-fetcher.ts`).

**Plano:** Adicionar uma nota sobre os modulos compartilhados abaixo da lista de Edge Functions.

---

## Arquivos a serem modificados

| Arquivo | Alteracao |
|---|---|
| `src/components/guia-projeto/features/modules/IAFeatures.tsx` | Adicionar 8 novas features (F-ADMIN-116 a 123), corrigir RN-F108-03, atualizar contagem |
| `src/components/guia-projeto/features/FeaturesAdminSection.tsx` | Atualizar count do modulo IA de 8 para 16 |
| `src/components/guia-projeto/integracoes/OpenAIIntegration.tsx` | Reescrever secao Function Calling com tools reais + arquitetura dinamica + roadmap |
| `src/components/guia-projeto/ImplementacaoTab.tsx` | Atualizar modulos F5 + adicionar nota sobre `_shared/` |

---

## Detalhes tecnicos

### Novas features a documentar em IAFeatures.tsx

Cada feature segue o padrao existente com: codigo, nome, modulo, plataforma, descricao, criticidade, regrasNegocio, permissoes, entidades.

As entidades referenciam as tabelas reais:
- `ai_agent_tools` (name, description, parameters_schema, handler_type, handler_config, is_active, requires_erp, sort_order)
- `ai_agent_flows` (name, slug, description, trigger_keywords, trigger_prompt, is_active, is_fixed, sort_order)
- `ai_agent_flow_steps` (flow_id, step_order, name, instruction, expected_input, tool_id, tool_auto_execute, condition_to_advance, fallback_instruction, is_active)
- `ai_processing_logs` (logs de erro do pipeline RAG)

### Correcao RN-F108-03

De: "Ordenacao padrao por sort_order, depois por nome"
Para: "Ordenacao alfabetica por nome"

### Secao Function Calling atualizada

Documentar a arquitetura dinamica:
1. Tools sao registradas no banco (ai_agent_tools) e gerenciadas pelo Admin
2. O ai-chat carrega tools ativas do agente e as injeta como OpenAI functions
3. Handler registry em `_shared/tool-handlers.ts` mapeia handler_type para funcoes
4. Tool Call Loop: ate 3 iteracoes de function calling antes de resposta final
5. Handlers implementados: `erp_search`, `erp_invoice_search`

