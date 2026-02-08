

# Limpeza do campo `is_premium` residual

## Problema

O campo `is_premium` foi removido da UI admin mas ainda persiste em dois lugares no painel ISP:

1. **`src/hooks/painel/useIspAgents.ts` (linha 53)**: o SELECT inclui `is_premium` no JOIN com `ai_agents`
2. **`src/hooks/painel/useIspAgents.ts` (linha 124)**: a logica de disponibilidade usa `!t.is_premium` como condicao

A disponibilidade ja e controlada pela tabela `ai_limits` (campo `is_enabled`), tornando `is_premium` redundante.

## Ordem de exibicao

A ordenacao dos agentes no admin ja e alfabetica por nome (`order('name')`). Nenhuma correcao necessaria.

## Plano de execucao

### Etapa 1 -- Remover `is_premium` do hook `useIspAgents.ts`

- **Linha 53**: Remover `is_premium` do SELECT do `ai_agents`
- **Linha 124**: Simplificar a logica de `isAvailable` para depender apenas de `ai_limits`:

```text
// Antes:
isAvailable: !t.is_premium || limits.some((l) => l.agent_id === t.id && l.is_enabled)

// Depois:
isAvailable: limits.length === 0 || limits.some((l) => l.agent_id === t.id && l.is_enabled)
```

Se nao houver limites configurados para o plano, todos os templates ficam disponiveis. Se houver, respeita o `is_enabled` de cada agente.

### Etapa 2 -- Remover `is_premium` do banco (migracao SQL)

Dropar a coluna `is_premium` da tabela `ai_agents` para evitar confusao futura:

```text
ALTER TABLE ai_agents DROP COLUMN IF EXISTS is_premium;
```

### Etapa 3 -- Regenerar types

O `src/integrations/supabase/types.ts` sera atualizado automaticamente para refletir a remocao da coluna.

