

# Corrigir Contagem de Tokens Usados no Mes

## Problema

O hook `useIspAiUsage.ts` usa o nome de campo `total_tokens` nas linhas 76 e 90, mas a coluna real na tabela `ai_usage` chama-se `tokens_total`. Isso faz com que o `reduce` sempre some `0`, resultando em "0 tokens usados este mes".

## Solucao

Corrigir as duas referencias no arquivo `src/hooks/painel/useIspAiUsage.ts`:

- **Linha 76**: `u.total_tokens` para `u.tokens_total`
- **Linha 90**: `u.total_tokens` para `u.tokens_total`

## Secao Tecnica

### Arquivo a modificar:
`src/hooks/painel/useIspAiUsage.ts`

### Alteracoes (2 linhas):

Linha 76:
```text
// De:
const totalTokens = typedUsageData.reduce((sum: number, u: any) => sum + (u.total_tokens || 0), 0);
// Para:
const totalTokens = typedUsageData.reduce((sum: number, u: any) => sum + (u.tokens_total || 0), 0);
```

Linha 90:
```text
// De:
tokens: current.tokens + (u.total_tokens || 0),
// Para:
tokens: current.tokens + (u.tokens_total || 0),
```

Sem impacto no backend. Sem novas dependencias. Sem migracao.

