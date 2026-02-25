

# Adicionar numero de ordem ao retorno de `fetchClientContracts`

## Problema
A funcao `fetchClientContracts` retorna contratos sem numero de ordem. O numero so e adicionado no handler (`tool-handlers.ts`) com `map((c, i) => ...)`. Se outro consumidor usar `fetchClientContracts`, nao tera o numero.

## Alteracoes

### 1. `erp-driver.ts` — Adicionar `ordem` ao `ContractResult` e popular no retorno

**Interface (linha 441-448):**
```typescript
export interface ContractResult {
  ordem: number;           // novo
  contrato_id: string;
  endereco_completo: string | null;
  plano: string | null;
  status_internet: string;
  dia_vencimento: string | null;
  provider_name: string;
}
```

**Atribuicao (linha 512-516):** Apos `Promise.all`, numerar sequencialmente:
```typescript
const results = await Promise.all(promises);
for (const r of results) {
  allContracts.push(...r.contracts);
  if (r.error) allErrors.push(r.error);
}

// Numerar contratos sequencialmente
allContracts.forEach((c, i) => { c.ordem = i + 1; });
```

### 2. `tool-handlers.ts` — Usar `c.ordem` em vez de `i + 1`

Nas linhas 194-199, trocar `i + 1` por `c.ordem`:
```typescript
instrucao_exibicao: "Apresente EXATAMENTE assim, sem nenhuma informação adicional:\nSobre qual contrato você gostaria de falar?\n" +
  result.contracts.map((c) => `${c.ordem}. ${c.endereco_completo}`).join("\n"),
lista_enderecos: result.contracts.map((c) => ({
  numero: c.ordem,
  endereco: c.endereco_completo,
})),
```

## Arquivos alterados

| Arquivo | Mudanca |
|---|---|
| `supabase/functions/_shared/erp-driver.ts` | Adicionar `ordem` a `ContractResult`, numerar apos agregacao |
| `supabase/functions/_shared/tool-handlers.ts` | Usar `c.ordem` em vez de indice manual |

## Deploy
Edge function `ai-chat`.

