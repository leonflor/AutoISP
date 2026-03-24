

# Plano: Unificar Schema entre UI e Backend

## Divergências encontradas

| Campo | Backend (context-builder + procedure-runner) | UI (useProcedures + ProcedureEditor) |
|-------|----------------------------------------------|--------------------------------------|
| `available_functions` | `string[]` | `{ handler, required }[]` |
| `advance_condition` | `string` (ex: `"always"`) | `{ type: "always", fields?, function_name? }` |
| `on_complete` action key | `outcome.action` | `on_complete.type` |
| `on_complete` conditions | `outcome.conditions[].if_context` | `conditions[].if` |
| stuck config | `stuck_after_turns` + `stuck_action` (flat) | `stuck_config: { max_turns, action }` (nested) |

## Decisao: Unificar no formato do backend

O backend e o banco ja estao alinhados. A UI e que precisa se adaptar. O `normalizeStep` ja faz parte desse trabalho, mas o `handleSubmit` precisa serializar corretamente, e os tipos em `useProcedures.ts` precisam refletir o formato real.

## Alteracoes

### 1. `src/hooks/admin/useProcedures.ts` — Alinhar tipos ao backend

Mudar `ProcedureStep` para refletir o formato real do banco:

```typescript
export type ProcedureStep = {
  name?: string;
  instruction: string;
  available_functions?: string[];
  advance_condition?: string; // "always" | "function_success" | ...
  on_complete?: {
    action: string; // "next_step" | "end_procedure" | "handover_human" | "conditional"
    reason?: string;
    conditions?: { if_context: string; then: Record<string, unknown> }[];
  };
  stuck_after_turns?: number;
  stuck_action?: string;
};
```

Remover os tipos `stuck_config` e o objeto `advance_condition` que so existem na UI.

### 2. `src/components/admin/procedures/ProcedureEditor.tsx` — Tipos internos da UI

Manter tipos internos ricos para a UI (`UIStep`) separados do tipo de persistencia. O `normalizeStep` converte DB→UI e o `handleSubmit` converte UI→DB.

Correcoes no `handleSubmit`:
- `on_complete.type` → `on_complete.action`
- `advance_condition.type` → `advance_condition` (string plana)
- `conditions[].if` → `conditions[].if_context`
- Ja converte `stuck_config` → `stuck_after_turns`/`stuck_action` (correto)
- Ja converte `available_functions` objeto → string[] (correto)

Correcoes no `normalizeStep`:
- `on_complete.action` → `on_complete.type` (para a UI)
- `advance_condition` string → `{ type: string }` (para a UI)
- `conditions[].if_context` → `conditions[].if` (para a UI)

### 3. Validar `advance_condition` no `normalizeStep`

Atualmente `normalizeStep` assume `advance_condition` como objeto, mas o banco salva string. Adicionar:

```typescript
const advance_condition = typeof raw.advance_condition === 'string'
  ? { type: raw.advance_condition }
  : raw.advance_condition ?? { type: 'always' };
```

### 4. Validar `on_complete` no `normalizeStep`

```typescript
const on_complete_raw = raw.on_complete ?? {};
const on_complete = {
  type: on_complete_raw.type ?? on_complete_raw.action ?? 'next_step',
  conditions: on_complete_raw.conditions?.map(c => ({
    if: c.if ?? c.if_context ?? '',
    then: c.then ?? '',
  })),
};
```

## Arquivos afetados

| Arquivo | Alteracao |
|---------|-----------|
| `src/hooks/admin/useProcedures.ts` | Alinhar tipo `ProcedureStep` com formato do banco |
| `src/components/admin/procedures/ProcedureEditor.tsx` | Corrigir `normalizeStep` e `handleSubmit` para mapear campos corretamente |

## Resultado
- Editor abre corretamente com dados legados e novos
- Salvar grava no formato que o `procedure-runner.ts` consome
- Sem necessidade de alterar backend

