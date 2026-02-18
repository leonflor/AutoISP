
# Atualizar Guia de Projeto com Estado Real da Implementacao de IA

## Contexto

O guia de projeto documenta as capacidades dos agentes de IA, mas varias secoes estao desatualizadas em relacao ao que foi realmente implementado. As principais discrepancias sao:

1. **IAFeatures.tsx** descreve tools e flows vinculados diretamente a agentes, mas a arquitetura atual usa **Procedimentos Reutilizaveis**
2. **OpenAIIntegration.tsx** lista apenas 2 handlers (erp_search, erp_invoice_search), faltando o `onu_diagnostics`. O prompt hierarquico mostra 5 camadas, mas sao 8 na implementacao real
3. **AgentesIAClienteFeatures.tsx** descreve funcionalidades aspiracionais (wizard, drag-and-drop, chain of thought) que nao correspondem a implementacao real baseada em catalogo/ativacao

## Alteracoes Planejadas

### 1. IAFeatures.tsx (Features Admin - modulo IA)

**O que muda:**
- Atualizar features F-ADMIN-116 a F-ADMIN-121 para refletir a arquitetura de Procedimentos
- Substituir "aba Tools no formulario do template" por "aba Procedimentos com pacotes reutilizaveis"
- Atualizar entidades de `ai_agent_tools` (vinculado a agente) para `ai_procedures`, `ai_procedure_tools`, `ai_procedure_flows`, `ai_agent_procedures`
- Adicionar feature para gerenciamento de Procedimentos (CRUD de ai_procedures)
- Atualizar contagem de 16 para o numero correto de features
- Adicionar handler `onu_diagnostics` nas regras de negocio de F-ADMIN-117

### 2. OpenAIIntegration.tsx (Integracoes - OpenAI)

**O que muda:**
- **Prompt Hierarquico**: Atualizar de 5 para 8 camadas (adicionar Tools, Fluxos Conversacionais, Context Anchoring)
- **Tools Implementadas**: Adicionar `onu_diagnostics` (3o handler) na tabela de tools
- **Arquitetura de Procedures**: Adicionar secao explicando que tools e flows sao carregados via `ai_procedures` -> `ai_procedure_tools`/`ai_procedure_flows`
- **Roadmap de Tools**: Remover `verificar_conexao` do roadmap (parcialmente coberto por onu_diagnostics)

### 3. AgentesIAClienteFeatures.tsx (Features Cliente - Agentes IA)

**O que muda:**
- Atualizar F-CLI-046 "Criar Novo Agente" para refletir modelo real: ISP ativa agentes de um **catalogo de templates** (nao wizard)
- Remover F-CLI-047 "Configurar Prompt do Agente" (ISP nao edita prompt do template)
- Atualizar F-CLI-048 "Configurar Persona" para refletir campos reais: display_name, avatar, voice_tone, escalation_config
- Remover F-CLI-049 "Regras de Negocio" (nao existe no painel ISP)
- Remover F-CLI-050 "Ferramentas" (ISP nao configura tools, vem do Procedure vinculado ao template)
- Remover F-CLI-051 "Fluxos de Conversa" (idem)
- Atualizar F-CLI-052 "Testar Agente" para refletir o `AgentTestDialog` real (chat simples, nao sandbox isolado)
- Atualizar F-CLI-058 "Base de Conhecimento" (ja esta correto, apenas ajustar detalhes)
- Remover features aspiracionais: F-CLI-054 (duplicar), F-CLI-055 (metricas), F-CLI-056 (horario), F-CLI-059 (idiomas), F-CLI-060 (logs conversa)
- Adicionar feature real: Visualizar uso de tokens (ai_usage stats)

### Nenhum arquivo novo sera criado

### Arquivos editados (3):
1. `src/components/guia-projeto/features/modules/IAFeatures.tsx`
2. `src/components/guia-projeto/integracoes/OpenAIIntegration.tsx`
3. `src/components/guia-projeto/features/modules/cliente/AgentesIAClienteFeatures.tsx`

---

## Detalhes Tecnicos

### Prompt Hierarquico Real (8 camadas no ai-chat):
1. System prompt base (template)
2. Tom de voz do ISP (voice_tone)
3. Documentos RAG (pgvector, top 5, threshold 0.7)
4. Q&A Manual (agent_knowledge_base)
5. Clausulas de Seguranca LGPD (ai_security_clauses)
6. Ferramentas Disponiveis (tools via procedures)
7. Fluxos Conversacionais (flows via procedures)
8. Context Anchoring (ISP name, data, agente)

### Handlers Implementados (3):
| handler_type | Descricao | Status |
|---|---|---|
| erp_search | Busca clientes no ERP | Funcional |
| erp_invoice_search | Lista faturas do cliente | Mock |
| onu_diagnostics | Diagnostico de sinal ONU | Funcional (IXC) |

### Arquitetura de Procedures:
- `ai_procedures` -> pacotes reutilizaveis
- `ai_procedure_tools` -> junction tools
- `ai_procedure_flows` -> junction flows
- `ai_agent_procedures` -> vinculo procedure-agente

### Painel ISP - Modelo Real:
- ISP ve catalogo de templates disponiveis
- Ativa agente do catalogo com personalizacao (nome, avatar, tom, escalacao)
- Gerencia base de conhecimento (docs + Q&A)
- Testa agente via chat
- Visualiza uso de tokens
- Nao edita prompt, tools, flows nem regras
