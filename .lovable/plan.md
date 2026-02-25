

# Alterar `erp_contract_lookup` para usar apenas `endereco` do contrato

## Problema
Atualmente a linha 489-491 concatena todos os campos de endereço (`endereco`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `cep`) em `endereco_completo`. O desejado é usar apenas `ct.endereco` (campo `endereco` de `cliente_contrato`).

## Alteração

**Arquivo: `supabase/functions/_shared/erp-driver.ts`** — linhas 489-491

De:
```typescript
const parts = [ct.endereco, ct.numero, ct.complemento, ct.bairro, ct.cidade, ct.estado, ct.cep]
  .filter((p) => p && p.trim() !== "" && p.trim() !== "0");
const endereco = parts.length > 0 ? parts.join(", ") : null;
```

Para:
```typescript
const endereco = ct.endereco && ct.endereco.trim() !== "" ? ct.endereco.trim() : null;
```

Nenhum outro arquivo precisa mudar — `endereco_completo` continua sendo o nome do campo no `ContractResult`, apenas o valor muda.

## Deploy
Edge function `ai-chat`.

