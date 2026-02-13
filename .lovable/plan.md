

## Ajustar Altura dos Cards ERP e Alinhar Botoes ao Rodape

### Problema
A altura minima de 340px esta muito grande, criando muito espaco vazio nos cards nao configurados.

### Solucao
- Reduzir `min-h-[340px]` para `min-h-[220px]` -- altura suficiente para acomodar o conteudo dos cards configurados sem deixar excesso nos nao configurados
- Manter `flex flex-col` no Card e `flex-1 flex flex-col justify-end` no CardContent para que os botoes fiquem sempre no rodape
- Separar o conteudo informativo dos botoes com `mt-auto` na div dos botoes, garantindo alinhamento inferior

### Arquivo a Modificar

| Arquivo | Alteracao |
|---|---|
| `src/components/painel/erp/ErpProviderCard.tsx` | Reduzir min-h para 220px e usar `mt-auto` nos botoes |

### Implementacao

```tsx
// Card: trocar min-h-[340px] por min-h-[220px]
<Card className={cn('transition-all hover:shadow-md flex flex-col min-h-[220px]', ...)}>

// CardContent: manter flex-1 flex flex-col, mas sem justify-between
<CardContent className="space-y-3 flex-1 flex flex-col">
  {/* conteudo informativo aqui */}
  
  {/* botoes sempre no rodape com mt-auto */}
  <div className="flex gap-2 mt-auto">
    ...
  </div>
</CardContent>
```

Resultado: cards com altura uniforme e compacta, botoes sempre alinhados na parte inferior.
