

# Plano: Editor de Procedimentos com Versionamento

## Resumo

Criar página `/admin/procedures` com listagem filtrada por template e editor completo de procedimentos (triggers, steps com function calls, condições de avanço, on_complete). Salvar sempre como nova versão (imutável).

## 1. Migration SQL — RLS para procedures (INSERT/UPDATE)

A tabela `procedures` atualmente **só permite SELECT** para authenticated. Precisa de policies para super_admin fazer INSERT e UPDATE (necessário para versionamento):

```sql
CREATE POLICY "Super admins can insert procedures"
ON public.procedures FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update procedures"
ON public.procedures FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));
```

## 2. Criar hook `useProcedures`

**`src/hooks/admin/useProcedures.ts`**

- `useQuery` para listar procedures com `is_current = true`, join com `agent_templates` (nome do template)
- Filtro opcional por `template_id`
- Count de `conversations` ativas por procedure (`active_procedure_id = procedure.id`)
- Mutation para criar nova versão:
  1. UPDATE `is_current = false` WHERE `name = X` AND `template_id = Y` AND `is_current = true`
  2. INSERT novo registro com `version = old.version + 1`, `is_current = true`
- Mutation para criar procedure novo (INSERT com version 1)

## 3. Criar página `/admin/procedures`

**`src/pages/admin/Procedures.tsx`**

- Filtro por template (select com templates do `useAgentTemplates`)
- Grid de cards: nome, template badge, nº de steps, versão atual, conversas ativas
- Botão "Novo Procedimento"
- Botão editar em cada card → abre editor

## 4. Criar editor de procedimento

**`src/components/admin/procedures/ProcedureEditor.tsx`** — modal fullscreen (Dialog)

### Seção 1 — Geral
- Nome, descrição, template vinculado (select), status toggle

### Seção 2 — Triggers
- Chips de keywords (input + Enter para adicionar, × para remover)
- Slider confiança mínima (50%–95%, default 70%)

### Seção 3 — Steps (lista vertical de cards expansíveis via Collapsible)
Cada step:
- Nome do step (input)
- Instrução (textarea)
- Function calls disponíveis: checkboxes usando items do `TOOL_CATALOG` (display_name) + handlers mapeados no user request
- Condição de avanço (select): `function_success` (+ qual function), `data_collected` (+ chips de fields), `user_confirmation`, `llm_judge`, `always`
- Ao concluir (select): `next_step`, `end_procedure` (resolved/unresolved), `handover_agent` (select tipo), `handover_human`, `conditional` (lista if/then)
- Se travar: nº de msgs (input number) + ação (select: escalate_human/repeat/skip/nunca)
- Botão "+" para novo step
- Drag handle para reordenar (opcional, pode ser setas up/down)

### Seção 4 — Salvar (versionamento imutável)
Ao salvar procedimento existente:
1. SET `is_current = false` no registro atual
2. INSERT novo com `version + 1`, `is_current = true`
3. Toast com versão
4. Warning se há conversas ativas na versão anterior

## 5. Atualizar sidebar e rotas

- `AdminSidebar.tsx`: adicionar item "Procedimentos" (icon `GitBranch`) após "Templates"
- `App.tsx`: lazy import + rota `<Route path="procedures" element={<ProceduresPage />} />`

## Arquivos

| Ação | Arquivo |
|------|---------|
| Migration | RLS INSERT/UPDATE para `procedures` |
| Criar | `src/hooks/admin/useProcedures.ts` |
| Criar | `src/pages/admin/Procedures.tsx` |
| Criar | `src/components/admin/procedures/ProcedureEditor.tsx` |
| Editar | `src/components/admin/AdminSidebar.tsx` |
| Editar | `src/App.tsx` |

