

# Fix: `conditional_routes` null constraint violation ao salvar fluxos

## Problema

Ao salvar etapas de fluxos conversacionais, quando `conditional_routes` está vazio, o código envia `undefined` para o banco. A coluna `conditional_routes` na tabela `ai_agent_flow_steps` é `NOT NULL DEFAULT '[]'::jsonb`, então `undefined` vira `null` no Supabase e viola a constraint.

## Causa

Nas linhas de payload dos dois editores:
```typescript
conditional_routes: s.conditional_routes.length > 0 ? s.conditional_routes : undefined,
```

Quando não há rotas, envia `undefined` ao invés de `[]`.

## Correção

Trocar `undefined` por `[]` em ambos os arquivos:

### 1. `src/components/admin/ai-agents/GlobalFlowStepsEditor.tsx` (linha 76)
```typescript
// De:
conditional_routes: s.conditional_routes.length > 0 ? s.conditional_routes : undefined,
// Para:
conditional_routes: s.conditional_routes.length > 0 ? s.conditional_routes : [],
```

### 2. `src/components/admin/ai-agents/AgentFlowStepsEditor.tsx` (linha 79)
```typescript
// De:
conditional_routes: s.conditional_routes.length > 0 ? s.conditional_routes : undefined,
// Para:
conditional_routes: s.conditional_routes.length > 0 ? s.conditional_routes : [],
```

Duas linhas alteradas, zero impacto em lógica.

