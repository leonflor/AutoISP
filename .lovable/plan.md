

# Plano: Corrigir modal de edição de procedimentos não carregando dados

## Problema

O `ProcedureEditor` usa `useState` com valores iniciais do `procedure` prop. Esses estados são definidos apenas na montagem do componente. Como o `Dialog` nunca desmonta (está sempre no DOM), ao clicar em outro card, o prop `procedure` muda mas os estados internos mantêm os valores antigos (ou vazios).

O `handleOpenChange` só reseta o estado para "novo procedimento" (`!procedure`), nunca sincroniza quando é edição.

## Solução

Adicionar um `useEffect` que sincroniza todos os estados internos quando o prop `procedure` muda:

### Arquivo: `src/components/admin/procedures/ProcedureEditor.tsx`

Adicionar após as declarações de estado (linha ~72):

```typescript
useEffect(() => {
  if (procedure) {
    setName(procedure.name ?? '');
    setDescription(procedure.description ?? '');
    setTemplateId(procedure.template_id ?? '');
    setIsActive(procedure.is_active ?? true);
    setKeywords(procedure.definition?.triggers?.keywords ?? []);
    setMinConfidence(procedure.definition?.triggers?.min_confidence ?? 70);
    setSteps(procedure.definition?.steps?.length ? procedure.definition.steps : [{ ...EMPTY_STEP }]);
    setOpenSteps({ 0: true });
  }
}, [procedure]);
```

Importar `useEffect` (já existe `useState` e `useCallback` no import, basta adicionar `useEffect`).

### Impacto
- Arquivo único alterado
- Ao clicar em qualquer card, o modal carrega os dados corretos
- Criação de novo procedimento continua funcionando via `handleOpenChange`

