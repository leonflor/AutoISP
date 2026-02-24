

# Nova Tool: Consulta de Contrato por ID do Cliente (`erp_contract_lookup`)

## Objetivo

Criar uma tool que recebe o `client_id` (obtido via `erp_client_lookup`) e retorna os contratos do cliente com **endereço de instalação** e **ID do contrato** — dados essenciais para atendimento e encadeamento com outras tools.

## Fluxo de Uso

```text
Usuário: "Qual o endereço do cliente CPF 123.456.789-00?"
  ↓
IA chama erp_client_lookup(cpf_cnpj: "12345678900")
  ↓ retorna { cliente_erp_id: "4521", ... }
  ↓
IA chama erp_contract_lookup(client_id: "4521")
  ↓ retorna { contrato_id: "780", endereco: "Rua X, 123 - Centro - Cidade/UF", plano: "100MB", ... }
  ↓
IA responde com dados do contrato
```

## Alterações

### 1. Camada 1 — `supabase/functions/_shared/erp-types.ts`

Adicionar tipo `RawContratoDetalhado` estendendo `RawContrato` com campos de endereço:

```typescript
export interface RawContratoDetalhado extends RawContrato {
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  complemento: string | null;
}
```

Adicionar método opcional ao `ErpProviderDriver`:

```typescript
fetchContratosDetalhados?(creds: ErpCredentials, filtro: { id_cliente: string }): Promise<RawContratoDetalhado[]>;
```

### 2. Camada 3 — `supabase/functions/_shared/erp-providers/ixc.ts`

Implementar `fetchContratosDetalhados` que reutiliza a mesma chamada ao endpoint `cliente_contrato` mas extrai os campos de endereço adicionais (`endereco`, `numero`, `bairro`, `cidade`, `estado`, `cep`, `complemento`) que o IXC ja retorna nesse endpoint.

### 3. Camada 2 — `supabase/functions/_shared/erp-driver.ts`

Adicionar função publica `fetchClientContracts()` que:
- Resolve configs ativos do ISP
- Para IXC: usa `fetchContratosDetalhados` com filtro `id_cliente`
- Para outros providers: fallback para `fetchContratos` (sem endereço, retorna null nos campos)
- Retorna contratos com endereço formatado

### 4. Backend Catalog — `supabase/functions/_shared/tool-catalog.ts`

Adicionar `erp_contract_lookup`:

```
erp_contract_lookup: {
  handler: "erp_contract_lookup",
  display_name: "Consulta de Contrato",
  description: "Consulta contratos ativos de um cliente por ID. Retorna ID do contrato, endereço de instalação, plano contratado e status.",
  parameters_schema: {
    type: "object",
    properties: {
      client_id: {
        type: "string",
        description: "ID do cliente no ERP (obtido via erp_client_lookup)"
      }
    },
    required: ["client_id"],
    additionalProperties: false
  },
  response_description: "Contratos ativos com contrato_id, endereço completo, plano, status e dia de vencimento.",
  requires_erp: true
}
```

### 5. Backend Handler — `supabase/functions/_shared/tool-handlers.ts`

Adicionar `erpContractLookupHandler` que:
- Recebe `client_id` como argumento obrigatorio
- Chama `fetchClientContracts()` do erp-driver
- Retorna lista de contratos com: `contrato_id`, `endereco_completo` (formatado), `plano`, `status_internet`, `dia_vencimento`, `provider_name`
- Se não encontrar contratos, retorna mensagem informativa

### 6. Frontend — `src/constants/tool-catalog.ts`

Adicionar entrada espelho para o admin UI.

### 7. Guia do Projeto — 2 arquivos

Atualizar `IAFeatures.tsx` e `OpenAIIntegration.tsx` para listar 4 tools.

## Resumo

| Arquivo | Ação |
|---|---|
| `_shared/erp-types.ts` | Adicionar `RawContratoDetalhado` + método no driver interface |
| `_shared/erp-providers/ixc.ts` | Implementar `fetchContratosDetalhados` com campos de endereço |
| `_shared/erp-driver.ts` | Adicionar `fetchClientContracts()` publica |
| `_shared/tool-catalog.ts` | Adicionar `erp_contract_lookup` |
| `_shared/tool-handlers.ts` | Adicionar handler + registrar |
| `src/constants/tool-catalog.ts` | Adicionar entrada espelho |
| Guia (2 arquivos) | Atualizar contagem para 4 tools |

