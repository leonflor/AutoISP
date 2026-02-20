

# Rotas Condicionais nos Fluxos Conversacionais

## Resumo

Adicionar o campo `conditional_routes` (JSONB) nas etapas dos fluxos, injetar as rotas no prompt do sistema diferenciando fixo/flexivel, ativar o `fallback_instruction` no prompt, e criar um editor visual de rotas nas telas de admin.

---

## 1. Migracao de Banco de Dados

Adicionar coluna `conditional_routes` na tabela `ai_agent_flow_steps`:

```text
ALTER TABLE ai_agent_flow_steps
ADD COLUMN conditional_routes jsonb NOT NULL DEFAULT '[]'::jsonb;
```

Estrutura esperada do JSON:
```text
[
  { "condition": "cliente offline", "goto_step": 4, "label": "Suporte Tecnico" },
  { "condition": "cliente online", "goto_step": null, "label": "Seguir proximo" }
]
```

- `condition`: texto semantico que a IA interpreta
- `goto_step`: numero da etapa destino (null = proxima)
- `label`: descricao curta para exibicao no admin

---

## 2. Injecao no Prompt (ai-chat/index.ts)

Na secao onde cada etapa e montada (linhas 237-246), adicionar:

- **Rotas condicionais**: se o step tiver `conditional_routes` com itens, injetar linhas tipo:
  ```text
  Rotas:
  - Se cliente offline -> Va para etapa 4 (Suporte Tecnico)
  - Se cliente online -> Siga para a proxima etapa
  ```

- **Fallback instruction**: se o step tiver `fallback_instruction`, injetar:
  ```text
  Fallback: Se nao conseguir determinar, pergunte ao cliente...
  ```

- **Regra diferenciada fixo/flexivel** (linhas 248-250):
  - Fixo: "Siga as etapas na ordem. Nao pule etapas, exceto quando uma rota condicional indicar explicitamente um salto."
  - Flexivel: "Use as etapas como guia. As rotas condicionais sao sugestoes fortes de navegacao."

---

## 3. Editor Visual - GlobalFlowStepsEditor

No componente `GlobalFlowStepsEditor.tsx`, para cada etapa:

- Adicionar campo `fallback_instruction` (Input) no grid existente
- Adicionar array `conditional_routes` no `StepDraft`
- Botao "+ Rota" dentro de cada step card que adiciona uma entrada `{ condition, goto_step, label }`
- Cada rota renderiza: Input "Condicao", Select "Ir para etapa" (lista numerada das etapas + opcao "Proxima"), botao remover
- Incluir `conditional_routes` no payload enviado ao `handleSave`

---

## 4. Editor Visual - AgentFlowStepsEditor

Mesmas alteracoes do GlobalFlowStepsEditor adaptadas para o contexto de agente (usa `tool_id` em vez de `tool_handler`).

---

## 5. Tipos TypeScript

Atualizar a interface `FlowStep` e `FlowStepInsert` em `useAgentFlows.ts`:

```text
interface ConditionalRoute {
  condition: string;
  goto_step: number | null;
  label: string;
}

// Adicionar em FlowStep:
conditional_routes: ConditionalRoute[];

// Adicionar em FlowStepInsert:
conditional_routes?: ConditionalRoute[];
```

---

## Detalhes Tecnicos

### Arquivos a modificar:

| Arquivo | Alteracao |
|---------|-----------|
| Nova migracao SQL | Adicionar coluna `conditional_routes jsonb default '[]'` |
| `supabase/functions/ai-chat/index.ts` | Injetar rotas e fallback no prompt (linhas 237-250) |
| `src/hooks/admin/useAgentFlows.ts` | Adicionar tipo `ConditionalRoute`, campo em `FlowStep` e `FlowStepInsert` |
| `src/components/admin/ai-agents/GlobalFlowStepsEditor.tsx` | Editor de rotas + campo fallback |
| `src/components/admin/ai-agents/AgentFlowStepsEditor.tsx` | Editor de rotas + campo fallback |

### Nenhuma dependencia nova necessaria.

### O campo `conditional_routes` usa `DEFAULT '[]'` para compatibilidade com etapas existentes (sem rotas = comportamento linear atual).

