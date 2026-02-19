
# Adicionar Texto de Ajuda ao Campo "Roteiro Fixo"

## Problema

O campo "Roteiro Fixo" (switch) nao possui nenhuma explicacao, obrigando o usuario a adivinhar a diferenca entre fixo e flexivel.

## Solucao

Adicionar um `FormDescription` abaixo do switch "Roteiro Fixo" em ambos os formularios, com texto curto explicando o comportamento:

> **Ativado:** etapas seguidas na ordem exata. **Desativado:** agente adapta a ordem conforme o contexto.

## Arquivos editados (2)

| Arquivo | Mudanca |
|---------|---------|
| `GlobalFlowForm.tsx` (linha 107) | Reestruturar o FormItem do `is_fixed` para incluir `FormDescription` abaixo do switch+label |
| `AgentFlowForm.tsx` (linhas 222-227) | Mesma alteracao |

## Detalhe tecnico

O layout atual usa `flex items-center gap-2` apenas com Switch + Label. Sera ajustado para empilhar verticalmente o par switch/label e a descricao:

```tsx
<FormItem className="flex flex-col gap-1">
  <div className="flex items-center gap-2">
    <FormControl>
      <Switch checked={field.value} onCheckedChange={field.onChange} />
    </FormControl>
    <FormLabel className="!mt-0">Roteiro Fixo</FormLabel>
  </div>
  <FormDescription className="text-xs">
    Ativado: etapas seguidas na ordem exata. Desativado: agente adapta a ordem conforme o contexto.
  </FormDescription>
</FormItem>
```

Sem mudanca funcional, apenas texto informativo adicionado.
