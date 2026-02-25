

# Estrategia unificada: CPF/CNPJ + filtro por endereco para faturas

## Contexto

Um cliente pode ter multiplos contratos (ex: residencia + comercio). Quando o usuario pede informacao financeira, a IA precisa saber de qual contrato. O fluxo natural eh:

1. Usuario informa CPF
2. IA busca contratos → retorna lista com enderecos
3. Usuario indica o endereco desejado
4. IA busca faturas filtrando pelo contrato daquele endereco

## Cadeia de dados IXC

```text
CPF/CNPJ
  └─ /cliente (cnpj_cpf) ──► id_cliente
       └─ /cliente_contrato (id_cliente) ──► id_contrato + endereco
            └─ /fn_areceber (id_contrato) ──► faturas
```

## Alteracoes

### 1. Todas as tools recebem `cpf_cnpj` (4 arquivos)

**`erp_contract_lookup`** e **`erp_onu_diagnostics`**: trocar `client_id` por `cpf_cnpj`. Internamente fazem `searchClients` para resolver o `cliente_erp_id`.

**`erp_invoice_search`**: renomear `cliente_id` para `cpf_cnpj` + adicionar parametro opcional `endereco` para filtrar o contrato correto.

### 2. Corrigir `fetchFaturas` no IXC (`supabase/functions/_shared/erp-providers/ixc.ts`)

Atualmente filtra `fn_areceber.id_cliente`. Precisa encadear por `id_contrato`:

```typescript
// Passo 1: buscar id_cliente pelo CPF (já existe)
// Passo 2 (NOVO): buscar contratos ativos do cliente
const contratos = await fetchContratos(creds, { id_cliente: idCliente });
// Passo 3: buscar faturas por id_contrato
for (const contrato of contratos) {
  const recs = await ixcFetch(baseUrl, headers, "fn_areceber", {
    qtype: "fn_areceber.id_contrato",
    query: contrato.id,
    oper: "=",
  });
  // acumular faturas abertas, incluindo contrato_id e endereco no retorno
}
```

Adicionar `contrato_id` ao retorno de `RawFatura` para que o Driver (Camada 2) possa associar fatura ao contrato.

### 3. Driver Camada 2: `fetchInvoices` inclui endereco (`supabase/functions/_shared/erp-driver.ts`)

Atualizar `fetchInvoices` para:
- Aceitar filtro opcional `endereco`
- Quando `endereco` fornecido: buscar contratos via `fetchClientContracts`, encontrar o `contrato_id` cujo endereco contem o texto, filtrar faturas apenas desse contrato
- Retornar `contrato_id` e `endereco` em cada fatura para contexto

### 4. Handler `erp_invoice_search` (`supabase/functions/_shared/tool-handlers.ts`)

```typescript
const erpInvoiceSearchHandler: ToolHandler = async (ctx, args) => {
  const cpfCnpj = String(args.cpf_cnpj || "").replace(/[\.\-\/]/g, "");
  const endereco = args.endereco ? String(args.endereco) : undefined;
  
  // Internamente: CPF → cliente → contratos → filtra por endereco → fn_areceber por id_contrato
  const result = await fetchInvoices(ctx.supabaseAdmin, ctx.ispId, ctx.encryptionKey, cpfCnpj, endereco);
  // ...
};
```

### 5. Handler `erp_contract_lookup` (`tool-handlers.ts`)

```typescript
const erpContractLookupHandler: ToolHandler = async (ctx, args) => {
  const cpfCnpj = String(args.cpf_cnpj || "").replace(/[\.\-\/]/g, "");
  // 1. searchClients(cpfCnpj) → matched[0].cliente_erp_id
  // 2. fetchClientContracts(clienteErpId)
};
```

### 6. Handler `erp_onu_diagnostics` (`tool-handlers.ts`)

```typescript
const onuDiagnosticsHandler: ToolHandler = async (ctx, args) => {
  const cpfCnpj = String(args.cpf_cnpj || "").replace(/[\.\-\/]/g, "");
  // 1. searchClients(cpfCnpj) → matched[0].cliente_erp_id
  // 2. fetchClientSignal(clienteErpId)
};
```

### 7. Catalogos (`tool-catalog.ts` backend + `src/constants/tool-catalog.ts` frontend)

| Ferramenta | Parametro antes | Parametro depois |
|---|---|---|
| `erp_client_lookup` | `cpf_cnpj` | `cpf_cnpj` (sem mudanca) |
| `erp_contract_lookup` | `client_id` | `cpf_cnpj` |
| `erp_invoice_search` | `cliente_id` | `cpf_cnpj` + `endereco` (opcional) |
| `erp_onu_diagnostics` | `client_id` | `cpf_cnpj` |

Descricao de `erp_invoice_search` atualizada para:
> "Consulta faturas em aberto por CPF/CNPJ. Quando o cliente tem multiplos contratos, use o parametro endereco para filtrar o contrato desejado (obtido via erp_contract_lookup)."

`response_description` de `erp_contract_lookup` atualizada para:
> "Contratos ativos com contrato_id, endereco completo, plano, status e dia de vencimento. Quando houver multiplos contratos, pergunte ao cliente qual endereco para consultas financeiras."

### 8. Tipo `RawFatura` (`erp-types.ts`)

Adicionar campo `id_contrato?: string` ao tipo `RawFatura` para rastreabilidade.

## Fluxo da IA na pratica

```text
Usuario: "Quero ver minhas faturas, CPF 123.456.789-00"
IA: chama erp_contract_lookup(cpf_cnpj: "12345678900")
    → 2 contratos: Rua A, 100 (contrato #1) | Rua B, 200 (contrato #2)
IA: "Encontrei 2 enderecos. Qual deseja consultar?"
Usuario: "Rua A"
IA: chama erp_invoice_search(cpf_cnpj: "12345678900", endereco: "Rua A")
    → faturas do contrato #1
```

## Arquivos alterados

1. `supabase/functions/_shared/erp-types.ts` — campo `id_contrato` em RawFatura
2. `supabase/functions/_shared/erp-providers/ixc.ts` — fetchFaturas usa id_contrato
3. `supabase/functions/_shared/erp-driver.ts` — fetchInvoices com filtro endereco + fetchClientContracts por CPF
4. `supabase/functions/_shared/tool-handlers.ts` — todos handlers recebem cpf_cnpj
5. `supabase/functions/_shared/tool-catalog.ts` — parametros e descricoes
6. `src/constants/tool-catalog.ts` — espelho frontend
7. Deploy: `ai-chat`

