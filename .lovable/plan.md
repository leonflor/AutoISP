

# Corrigir Modal de Fluxos: Alinhar ao Topo com Scroll

## Problema

Ao clicar em "Novo" nos Fluxos Conversacionais, o modal abre centralizado verticalmente e nao se adapta quando o conteudo excede a tela -- parte do formulario fica cortada sem possibilidade de scroll.

## Solucao

Aplicar o padrao de modal responsivo nos dois formularios de fluxo: alinhar ao topo, limitar altura maxima e adicionar ScrollArea no conteudo.

## Arquivos editados (2)

| Arquivo | Mudanca |
|---------|---------|
| `GlobalFlowForm.tsx` | Alterar `DialogContent` para usar classes de topo + scroll |
| `AgentFlowForm.tsx` | Mesma alteracao |

## Detalhe tecnico

Em ambos os arquivos, o `DialogContent` sera alterado de:

```tsx
<DialogContent className="max-w-lg">
```

Para:

```tsx
<DialogContent className="max-w-lg max-h-[90vh] flex flex-col top-[5vh] translate-y-0">
```

E o conteudo do formulario sera envolvido em `ScrollArea` para permitir rolagem:

```tsx
<ScrollArea className="flex-1 overflow-y-auto pr-2">
  <form ...>
    ...campos...
  </form>
</ScrollArea>
```

O `DialogHeader` e `DialogFooter` ficam fora do scroll para permanecerem sempre visiveis.

Isso segue o padrao ja estabelecido no projeto para modais complexos (`max-h-[90vh]`, `flex flex-col`, `ScrollArea`).
