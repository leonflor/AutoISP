

# Otimizar conector IXC usando `grid_param` e filtro combinado

## Problema atual

A funcao `ixcFetch` so suporta um filtro simples (`qtype/query/oper`). Isso causa:

1. **Lookup por CPF**: faz query por CPF mas nao filtra `ativo=S`, retornando clientes inativos desnecessariamente
2. **Fetch em massa**: busca todos os 5000 registros sem filtro de ativos — o frontend filtra depois
3. **Faturas**: busca uma fatura por contrato de cada vez (N queries sequenciais) em vez de usar `grid_param` para combinar filtros
4. **Sem paginacao real**: usa `rp=5000` fixo, se houver mais registros perde dados

## Solucao

Refatorar `ixcFetch` para suportar `grid_param` e usar filtros combinados conforme a documentacao da API IXC.

### Mudancas

#### 1. `_shared/erp-providers/ixc.ts` — Refatorar `ixcFetch`

Adicionar suporte a `grid_param` como parametro opcional:

```typescript
async function ixcFetch(
  baseUrl: string,
  headers: Record<string, string>,
  endpoint: string,
  filter?: { qtype: string; query: string; oper: string },
  gridParam?: Array<{ TB: string; OP: string; P: string }>,
  options?: { rp?: string; sortname?: string; sortorder?: string }
): Promise<any[]>
```

Quando `gridParam` for fornecido, serializa como `JSON.stringify(gridParam)` no campo `grid_param` do body.

#### 2. `ixc_client_lookup` — Filtrar ativos + CPF com grid_param

Quando buscar por CPF, usar `grid_param` para combinar `ativo=S` com o filtro de documento, como na documentacao:

```text
qtype: "cliente.ativo", query: "S", oper: "="
grid_param: [{"TB":"cliente.cnpj_cpf", "OP":"=", "P":"627.105.245-20"}]
```

Manter a logica de variantes (CPF formatado/sem formato) mas agora cada tentativa ja filtra por ativos.

Para busca em massa (sem filtro de CPF), adicionar `qtype: "cliente.ativo", query: "S"` para trazer apenas ativos.

#### 3. `ixc_invoice_search` — Usar grid_param para status + contrato

Combinar `status=A` com `id_contrato` na mesma query em vez de filtrar no JavaScript:

```text
qtype: "fn_areceber.id_contrato", query: "123", oper: "="
grid_param: [{"TB":"fn_areceber.status", "OP":"=", "P":"A"}]
```

Remove o `.filter(f => f.status === "A")` pos-fetch.

#### 4. `ixc_contract_lookup` — Filtrar ativos via grid_param

Quando buscar por `id_cliente`, combinar com `status=A` via grid_param em vez de filtrar pos-fetch:

```text
qtype: "cliente_contrato.id_cliente", query: "42", oper: "="
grid_param: [{"TB":"cliente_contrato.status", "OP":"=", "P":"A"}]
```

Remove o `.filter(ct => ct.status === "A")` pos-fetch.

## Resultado esperado

- Menos dados trafegados (API retorna apenas registros relevantes)
- Menos processamento no servidor (filtros aplicados no banco do ERP)
- Mesma interface publica — nenhuma mudanca no Driver (Camada 2) ou tool-handlers

## Arquivo alterado

| Arquivo | Mudanca |
|---|---|
| `supabase/functions/_shared/erp-providers/ixc.ts` | Adicionar `grid_param` ao `ixcFetch`, otimizar 4 funcoes de busca |

