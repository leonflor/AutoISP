

# Adicionar filtro "Nao Ativo" na pagina de Assinantes

## Contexto

A pagina de Assinantes (`src/pages/painel/Subscribers.tsx`) possui um filtro de status com as opcoes: Todos, Ativos, Suspensos, Bloqueados, Cancelados. O usuario quer um filtro adicional "Nao Ativo" que retorna todos os clientes cujo status NAO e "ativo" (ou seja, suspensos + bloqueados + cancelados + qualquer outro status).

## Alteracoes

### 1. `src/pages/painel/Subscribers.tsx`

- Adicionar a opcao `<SelectItem value="nao_ativo">Nao Ativos</SelectItem>` no Select de status, logo apos "Ativos" (linha 171)

### 2. `src/hooks/painel/useErpClients.ts`

- Na logica de filtragem (linha 80), tratar o caso especial `nao_ativo`: em vez de comparar com `status_contrato`, filtrar por `status_contrato !== "ativo"`
- Adicionar `naoAtivos` ao objeto `stats` para exibir a contagem

A logica de filtro ficara assim:

```typescript
if (status && status !== "all") {
  if (status === "nao_ativo") {
    if (c.status_contrato === "ativo") return false;
  } else {
    if (c.status_contrato !== status) return false;
  }
}
```

Nenhuma alteracao na edge function e necessaria, pois a filtragem e feita no lado do cliente.
