
# Botao Salvar Sempre Visivel (Desabilitado quando sem alteracoes)

## Problema

O botao "Salvar" aparece e desaparece conforme ha edicoes pendentes, causando deslocamento visual do botao "+ Etapa".

## Solucao

Manter o botao "Salvar" sempre renderizado, mas desabilitado (`disabled`) quando nao houver alteracoes (`dirty === false`). Aplicar tambem opacidade reduzida para feedback visual.

## Arquivos editados (2)

| Arquivo | Mudanca |
|---------|---------|
| `GlobalFlowStepsEditor.tsx` (linha 81) | Remover `{dirty &&`, manter botao sempre visivel com `disabled={!dirty \|\| saveSteps.isPending}` |
| `AgentFlowStepsEditor.tsx` (linhas 121-125) | Mesma alteracao: remover condicional `{dirty &&`, usar `disabled={!dirty \|\| saveSteps.isPending}` |

## Detalhe tecnico

**Antes:**
```tsx
{dirty && <Button size="sm" onClick={handleSave} disabled={saveSteps.isPending}>...}
```

**Depois:**
```tsx
<Button size="sm" onClick={handleSave} disabled={!dirty || saveSteps.isPending}>...
```

Apenas CSS/logica de renderizacao, sem mudanca funcional.
