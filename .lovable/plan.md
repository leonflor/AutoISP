

# Atualizar Guia do Projeto com Nova Arquitetura IA

## Problema

O arquivo `IAFeatures.tsx` ainda documenta a arquitetura antiga com Procedimentos, Tools CRUD e tabelas depreciadas. As mudancas recentes (catalogo hardcoded, fluxos globais, ai_agent_flow_links) nao estao refletidas.

## Secoes Desatualizadas

### IAFeatures.tsx (principal)

| Feature | Estado Atual | Correcao |
|---------|-------------|----------|
| F-ADMIN-109 (Criar Template) | Menciona aba "Procedimentos" | Atualizar para aba "Fluxos" |
| F-ADMIN-116 (Procedimentos Reutilizaveis) | Documenta camada eliminada | Remover completamente |
| F-ADMIN-117 (Tools Globais CRUD) | Documenta CRUD em ai_agent_tools | Substituir por "Catalogo de Ferramentas (read-only)" |
| F-ADMIN-118 (Fluxos Conversacionais) | Referencia ai_procedure_flows | Atualizar: fluxos globais, steps com tool_handler, sem ai_procedure_flows |
| F-ADMIN-119 (Vincular Procedimentos) | Usa ai_agent_procedures | Substituir por "Vincular Fluxos a Agentes" via ai_agent_flow_links |

### Novas features a documentar

| Feature | Descricao |
|---------|-----------|
| Catalogo de Ferramentas (read-only) | Pagina /admin/ai-tools exibe tools hardcoded com schemas e descricoes |
| Vincular Fluxos a Agentes | Aba "Fluxos" no template usa checkboxes para vincular fluxos globais via ai_agent_flow_links |
| Validacao em 3 Camadas | Instrucao do fluxo, JSON Schema da tool, handler no backend |

## Secao Tecnica - Mudancas no Codigo

### Arquivo: `src/components/guia-projeto/features/modules/IAFeatures.tsx`

1. **F-ADMIN-109** (linha 72): Trocar "Procedimentos" por "Fluxos" na descricao das 5 abas
2. **Remover F-ADMIN-116** (linhas 199-217): Feature de Procedimentos eliminada
3. **Reescrever F-ADMIN-117** como "Catalogo de Ferramentas (Read-Only)":
   - Descricao: exibe tools hardcoded (erp_search, erp_invoice_search, onu_diagnostics) com schemas
   - Entidades: nenhuma tabela (catalogo em codigo)
   - Regras: read-only, sem CRUD, filtro por requires_erp
4. **Atualizar F-ADMIN-118**:
   - Remover referencia a ai_procedure_flows
   - Steps agora usam tool_handler (string) em vez de tool_id (UUID)
   - Adicionar ai_agent_flow_steps.tool_handler nas entidades
5. **Reescrever F-ADMIN-119** como "Vincular Fluxos a Agentes":
   - Tabela junction: ai_agent_flow_links (agent_id, flow_id, is_active, sort_order)
   - Substituir ai_agent_procedures por ai_agent_flow_links
6. **Atualizar contagem**: de 14 para 13 features (removendo Procedimentos)

### Arquivo: `src/components/guia-projeto/ResumoProjetoTab.tsx`

- Linha 342: Atualizar "arquitetura de agentes em 3 camadas" para mencionar a nova arquitetura simplificada (Agent -> Flows -> Steps -> tool_handler)

### Arquivo: `src/components/guia-projeto/ImplementacaoTab.tsx`

- Sem mudancas necessarias (as fases e edge functions listadas continuam validas)

## Resumo de Impacto

- 2 arquivos editados (IAFeatures.tsx, ResumoProjetoTab.tsx)
- 1 feature removida (Procedimentos)
- 2 features reescritas (Tools, Vincular)
- 2 features atualizadas (Criar Template, Fluxos)
- 1 nova secao sobre validacao em 3 camadas

