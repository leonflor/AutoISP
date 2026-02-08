

# Redesign: Pagina Dedicada para Editar Agente de IA

## Problema Atual

O formulario de agente e um **Sheet** (painel lateral) com 6 abas comprimidas. As abas "Tools" e "Fluxos" abrem **Dialogs em cima do Sheet**, causando:
- Modais empilhados (Sheet + Dialog) com conflitos de z-index
- Espaco reduzido para editar conteudo complexo (Steps do Fluxo, JSON Schema das Tools)
- Abas "Tools" e "Fluxos" desabilitadas ate salvar o agente (fluxo confuso)
- 6 abas em `grid-cols-6` ficam apertadas e pouco legíveis

## Solucao: Pagina `/admin/ai-agents/:id`

Substituir o Sheet por uma **pagina dedicada** com layout espaçoso, eliminando modais aninhados.

```text
/admin/ai-agents          --> Lista de agentes (mantida)
/admin/ai-agents/novo     --> Criar novo agente
/admin/ai-agents/:id      --> Editar agente existente
```

### Layout da Pagina

```text
+----------------------------------------------------------+
| < Voltar para Agentes     [Salvar Alteracoes]            |
| Assistente de Suporte     [Cancelar]                     |
+----------------------------------------------------------+
| [Basico] [Config IA] [Features] [Personal.] [Tools] [Fluxos] |
+----------------------------------------------------------+
|                                                          |
|  (conteudo da aba ativa -- largura total da pagina)      |
|                                                          |
+----------------------------------------------------------+
```

- Header fixo com botao "Voltar" (navegacao via `react-router-dom`), nome do agente e botoes de acao
- Abas horizontais com mais espaco para respirar
- Tools e Fluxos ficam **sempre habilitadas** (para agentes novos, a pagina redireciona apos primeiro save)

### Fluxo de Criacao (Novo Agente)

1. Clicar "Novo Agente" na lista redireciona para `/admin/ai-agents/novo`
2. Pagina mostra apenas as abas relevantes (Basico, Config IA, Features, Personalizacao)
3. Ao clicar "Criar Agente", salva e redireciona para `/admin/ai-agents/:id` com todas as abas habilitadas
4. Uma mensagem orienta: "Agente criado! Agora configure Tools e Fluxos."

### Tools e Fluxos Inline

Os formularios de Tool e Fluxo continuam usando **Dialog**, porem agora abrem sobre a pagina (nao sobre um Sheet), eliminando o problema de z-index. O `AgentFlowStepsEditor` ganha mais espaco horizontal.

---

## Arquivos a serem modificados/criados

| Arquivo | Acao |
|---|---|
| `src/pages/admin/AiAgentDetail.tsx` | **Novo** -- Pagina dedicada de edicao/criacao |
| `src/pages/admin/AiAgents.tsx` | Refatorar -- Remover Sheet, usar `navigate()` |
| `src/components/admin/ai-agents/AgentTemplateForm.tsx` | Refatorar -- Converter de Sheet para componente de formulario inline |
| `src/App.tsx` | Adicionar rotas `ai-agents/novo` e `ai-agents/:id` |

### Detalhes tecnicos

#### 1. Nova rota em `App.tsx`

Adicionar dentro do bloco `<Route path="/admin">`:
```text
<Route path="ai-agents/novo" element={<AiAgentDetail />} />
<Route path="ai-agents/:id" element={<AiAgentDetail />} />
```

#### 2. `AiAgentDetail.tsx` (nova pagina)

- Usa `useParams()` para obter `:id` (ou "novo")
- Carrega dados do agente via query existente (`useAiAgentTemplates`)
- Header com:
  - Botao "Voltar" (`navigate('/admin/ai-agents')`)
  - Titulo dinamico (nome do agente ou "Novo Agente")
  - Botoes "Cancelar" e "Salvar"
- Renderiza o formulario inline (componente refatorado do `AgentTemplateForm`)
- Abas Tools e Fluxos habilitadas apenas quando `id !== 'novo'`

#### 3. Refatorar `AgentTemplateForm.tsx`

- Remover `Sheet`, `SheetContent`, `SheetHeader`
- Remover props `open`/`onOpenChange` (nao e mais um modal)
- Exportar como componente de formulario puro que recebe `agent`, `onSubmit`, `isSubmitting`
- Manter toda a logica de form, validacao e abas
- Expandir `TabsList` para usar mais espaco (nao mais `grid-cols-6` comprimido)
- Remover `ScrollArea` wrapper (a pagina inteira faz scroll)

#### 4. Atualizar `AiAgents.tsx`

- Remover estado `formOpen`, `editingAgent`, e o componente `<AgentTemplateForm />`
- `handleCreate` -> `navigate('/admin/ai-agents/novo')`
- `handleEdit` -> `navigate('/admin/ai-agents/${agent.id}')`
- Manter a logica de duplicar (duplica e redireciona para o novo ID)
- Manter a logica de excluir (permanece na lista)

#### 5. `AgentTemplateTable.tsx`

- `onEdit` agora chama `navigate` em vez de abrir modal
- Sem mudanca na estrutura da tabela

