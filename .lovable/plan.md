

# Gerenciamento de Fluxos Globais -- Visualizacao e Edicao

## Situacao atual

A aba "Fluxos" dentro de Procedimentos de IA so mostra checkboxes para vincular/desvincular fluxos. Nao e possivel ver as etapas, keywords de gatilho, instrucoes ou editar nada do conteudo do fluxo. Os hooks de CRUD global ja existem (`useGlobalFlows`, `useSaveGlobalFlowSteps`, `useCreateGlobalFlow`, `useUpdateGlobalFlow`, `useDeleteGlobalFlow`) mas nao estao conectados a nenhuma interface de edicao.

## Proposta: Abordagem hibrida

Criar uma pagina dedicada para gerenciar fluxos globais E melhorar a aba de Fluxos nos Procedimentos com visualizacao inline.

### 1. Pagina dedicada de Fluxos Globais

**Rota:** `/admin/ai-flows`

**Funcionalidades:**
- Listagem de todos os fluxos globais (nome, descricao, status, quantidade de etapas, keywords)
- Botao "Novo Fluxo" que abre um dialog/formulario para criar
- Cada fluxo e expansivel (Collapsible) para mostrar e editar suas etapas
- Acoes: editar metadados, ativar/desativar, excluir
- Reutilizar a logica do `AgentFlowStepsEditor` adaptada para o contexto global (sem `agentId`)

**Componentes a criar:**
- `src/pages/admin/AiFlows.tsx` -- pagina principal
- `src/components/admin/ai-agents/GlobalFlowForm.tsx` -- dialog para criar/editar metadados do fluxo
- `src/components/admin/ai-agents/GlobalFlowStepsEditor.tsx` -- editor de etapas adaptado para contexto global

**Navegacao:** Adicionar item "Fluxos" no `AdminSidebar` dentro da secao de IA.

### 2. Melhorar aba Fluxos no Procedimento

Na `ProcedureFlowsSection` do `AiProcedureDetail.tsx`:
- Cada fluxo vinculado tera um botao "Ver detalhes" ou sera expansivel (Collapsible)
- Ao expandir, mostra as etapas do fluxo em modo somente leitura
- Link "Editar fluxo" que redireciona para `/admin/ai-flows` ou abre o editor inline

### 3. Rota no App.tsx

Adicionar a rota `/admin/ai-flows` no router.

## Secao tecnica

### Arquivos a criar

1. **`src/pages/admin/AiFlows.tsx`**
   - Usa `useGlobalFlows()` para listar
   - Usa `useCreateGlobalFlow()`, `useUpdateGlobalFlow()`, `useDeleteGlobalFlow()` para CRUD
   - Layout com cards expansiveis (Collapsible) igual ao `AgentFlowsTab`

2. **`src/components/admin/ai-agents/GlobalFlowForm.tsx`**
   - Dialog com campos: nome, slug, descricao, keywords de gatilho, is_fixed, is_active
   - Baseado no `AgentFlowForm` existente mas sem `agent_id`

3. **`src/components/admin/ai-agents/GlobalFlowStepsEditor.tsx`**
   - Copia do `AgentFlowStepsEditor` adaptada:
     - Usa `useSaveGlobalFlowSteps()` em vez de `useSaveFlowSteps()`
     - Usa `useGlobalTools()` para listar ferramentas disponiveis nos selects
     - Remove dependencia de `agentId`

### Arquivos a modificar

4. **`src/components/admin/AdminSidebar.tsx`**
   - Adicionar link "Fluxos" na secao de IA, apontando para `/admin/ai-flows`

5. **`src/App.tsx`**
   - Adicionar rota `<Route path="ai-flows" element={<AiFlows />} />`

6. **`src/pages/admin/AiProcedureDetail.tsx`**
   - Na `ProcedureFlowsSection`: adicionar Collapsible em cada fluxo para mostrar etapas em modo leitura
   - Adicionar botao "Editar" que navega para `/admin/ai-flows`

### Fluxo de uso

```text
Superadmin
  |
  +-- /admin/ai-flows -----------> Cria/edita fluxos globais com etapas
  |
  +-- /admin/ai-procedures/:id
       |
       +-- Aba "Fluxos" --------> Vincula fluxos ao procedimento (checkbox)
                                   Visualiza etapas em modo leitura (Collapsible)
                                   Link para editar em /admin/ai-flows
```

