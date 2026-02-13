
## Padronizar Altura dos Cards de Integração ERP

### Problema Identificado

Os cards de integração ERP (IXC, MK-Solutions, SGP e Hubsoft) apresentam alturas diferentes porque:

1. **Conteúdo Dinâmico**: Cards não configurados mostram apenas os botões, enquanto cards configurados exibem:
   - URL da API
   - Data de conexão
   - Chave mascarada
   
2. **Falta de Altura Fixa**: O componente `Card` e `CardContent` usam altura automática (height: auto), permitindo que o conteúdo expanda ou contraia livremente

3. **Impacto Visual**: Especialmente em layouts de grid (`lg:grid-cols-4`), a variação de altura prejudica a alinhamento visual

### Solução Proposta

Adicionar altura mínima padronizada ao componente `ErpProviderCard` para garantir que todos os cards tenham o mesmo tamanho, independentemente do estado (configurado ou não).

**Abordagem**:
- Envolver o `Card` com um `div` que tenha `h-full` (height: 100%) 
- Usar `min-h-[340px]` ou similar no Card para garantir uma altura mínima consistente
- Usar `flex flex-col` no Card para estruturar o conteúdo verticalmente
- Usar `flex-1` no `CardContent` para preencher o espaço disponível

**Benefícios**:
- Todos os cards ficam com mesma altura, criando alinhamento visual perfeito
- O espaço extra é preenchido naturalmente no CardContent
- Responsivo: a altura pode ser ajustada para mobile se necessário
- Sem impacto na funcionalidade existente

### Arquivo a Modificar

| Arquivo | Alteração |
|---|---|
| `src/components/painel/erp/ErpProviderCard.tsx` | Adicionar `min-h-[340px] flex flex-col` ao Card e `flex-1` ao CardContent |

### Implementação Técnica

```tsx
// De:
<Card className={cn('transition-all hover:shadow-md', isConfigured && 'border-green-500/30 bg-green-500/5')}>
  <CardHeader className="pb-3">
    ...
  </CardHeader>
  <CardContent className="space-y-3">
    ...
  </CardContent>
</Card>

// Para:
<Card className={cn('transition-all hover:shadow-md flex flex-col min-h-[340px]', isConfigured && 'border-green-500/30 bg-green-500/5')}>
  <CardHeader className="pb-3">
    ...
  </CardHeader>
  <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
    ...
  </CardContent>
</Card>
```

Resultado esperado: todos os 4 cards da grid terão exatamente a mesma altura, criando um alinhamento visual perfeito na página de Integração ERP.
