

## Plano: Reorganizar arquitetura de ferramentas com Response Models explícitos

### Problema atual

Hoje o mapeamento ERP → resposta para IA está espalhado em 3 lugares diferentes:
- `erp-driver.ts`: funções `mapClienteFromProvider`, `resolveClienteErpId`, `fetchClientContracts`, `fetchInvoices` — cada uma monta sua própria estrutura de resposta
- `tool-handlers.ts`: cada handler re-empacota os dados do driver num formato diferente para a IA
- Não existe um "contrato" explícito do que a IA recebe

### Nova arquitetura proposta

```text
┌─────────────────────────────────────────────────┐
│  TOOL HANDLER (tool-handlers.ts)                │
│  - Valida input (cpf_cnpj)                      │
│  - Chama orquestrador                           │
│  - Retorna ToolResult<ResponseModel>             │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│  ORQUESTRADOR (erp-driver.ts)                   │
│  - resolveActiveConfigs() → configs[]           │
│  - Para cada config: getProvider() + creds      │
│  - Chama provider.fetchClientes(creds, filtro)  │
│  - Mapeia raw → ResponseModel via FIELD_MAP     │
│  - Agrega resultados de todos os ERPs           │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│  PROVIDER (erp-providers/*.ts)                  │
│  - HTTP puro, retorna any[]                     │
│  - Sem mudanças                                 │
└─────────────────────────────────────────────────┘
```

### Estrutura de pastas (nova)

```text
supabase/functions/_shared/
├── response-models.ts          ← NOVO: interfaces que definem O QUE a IA recebe
├── field-maps.ts               ← NOVO: mapeamento ERP → modelo, por provider
├── erp-driver.ts               ← REFATORADO: orquestra e aplica field-maps
├── tool-handlers.ts            ← SIMPLIFICADO: valida input, chama driver, retorna modelo
├── tool-catalog.ts             ← sem mudanças
├── erp-types.ts                ← LIMPEZA: remove Raw types que migram para field-maps
├── erp-providers/
│   ├── index.ts
│   ├── ixc.ts                  ← sem mudanças (HTTP puro)
│   ├── sgp.ts
│   └── mk.ts
└── onu-signal-analyzer.ts
```

### 1. `response-models.ts` — Contratos de resposta para a IA

Define interfaces tipadas que representam **exatamente** o JSON que a IA recebe:

```typescript
/** Modelo: erp_client_lookup */
export interface ClienteResponse {
  nome: string;
  cpf_cnpj: string;
  erp: string;              // nome legível do ERP
}

/** Modelo: erp_contract_lookup */
export interface ContratoResponse {
  ordem: number;
  contrato_id: string;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  endereco_completo: string | null;
  plano: string | null;
  status: string;
  dia_vencimento: string | null;
  erp: string;
}

/** Modelo: erp_invoice_search */
export interface FaturaResponse {
  id: string;
  contrato_id: string | null;
  endereco: string | null;
  valor: number;
  vencimento: string;
  dias_atraso: number;
  linha_digitavel: string | null;
  gateway_link: string | null;
  erp: string;
}

/** Envelope padrão que toda ferramenta retorna */
export interface ToolEnvelope<T> {
  encontrados: number;
  itens: T[];
  mensagem?: string;
  erros: string[];
}
```

### 2. `field-maps.ts` — Mapeamento declarativo por provider

Substitui as funções `mapClienteFromProvider`, `mapContratoFromProvider`, etc., por objetos declarativos:

```typescript
import type { ErpProvider } from "./erp-types.ts";

type FieldMapper<T> = Record<ErpProvider, (raw: any) => T>;

// Exemplo para Cliente:
export const mapCliente: FieldMapper<{ id: string; nome: string; cpf_cnpj: string }> = {
  ixc: (raw) => ({
    id: String(raw.id),
    nome: raw.razao || raw.fantasia || "",
    cpf_cnpj: raw.cnpj_cpf || "",
  }),
  sgp: (raw) => ({
    id: String(raw.id || raw.codigo || ""),
    nome: raw.nome || raw.razao_social || "",
    cpf_cnpj: raw.cpf_cnpj || raw.cpf || raw.cnpj || "",
  }),
  mk_solutions: (raw) => ({
    id: String(raw.CodigoCliente || raw.id || ""),
    nome: raw.NomeRazaoSocial || raw.nome || "",
    cpf_cnpj: raw.CpfCnpj || raw.cpf_cnpj || "",
  }),
  hubsoft: (raw) => ({ id: String(raw.id || ""), nome: raw.nome || "", cpf_cnpj: raw.cpf_cnpj || "" }),
};

// Mesmo padrão para mapContrato, mapFatura, mapRadusuario, mapFibra
```

### 3. `erp-driver.ts` — Refatoração

- Remove todas as funções `map*FromProvider` (migram para `field-maps.ts`)
- Remove interfaces `RawCliente`, `RawContrato`, etc. do `erp-types.ts` (ficam implícitas no field-map)
- Cada função pública (`resolveClienteErpId`, `fetchClientContracts`, `fetchInvoices`) importa o mapper e retorna diretamente o `ResponseModel`
- A função `resolveActiveConfigs` e `resolveCredentials` permanecem

### 4. `tool-handlers.ts` — Simplificação

Cada handler fica responsável apenas por:
1. Validar input
2. Chamar a função do driver (que já retorna o `ResponseModel`)
3. Encapsular no `ToolEnvelope` e retornar

```typescript
const erpClientLookupHandler: ToolHandler = async (ctx, args) => {
  // 1. Valida
  const cpf = validateCpfCnpj(args.cpf_cnpj);
  if (!cpf) return { success: false, error: "CPF/CNPJ inválido" };

  // 2. Chama driver (já retorna ClienteResponse[])
  const result = await buscarCliente(ctx.supabaseAdmin, ctx.ispId, ctx.encryptionKey, cpf);

  // 3. Retorna envelope
  return {
    success: true,
    data: {
      encontrados: result.itens.length,
      itens: result.itens,
      erros: result.erros,
    },
  };
};
```

### 5. `erp-types.ts` — Limpeza

- Remover: `RawCliente`, `RawContrato`, `RawRadusuario`, `RawFibraRecord`, `RawFatura` (absorvidos pelo `field-maps.ts`)
- Remover: `ErpInvoice`, `FaturaFilter` (substituídos pelos response models)
- Manter: `ErpProvider`, `PROVIDER_DISPLAY_NAMES`, `ErpCredentials`, `TestResult`, `ErpProviderDriver`, `InternetStatus`
- Manter: `ErpClient` (usado pelo frontend/lista de assinantes, não pela IA)

### Resumo de arquivos

| Arquivo | Ação |
|---|---|
| `response-models.ts` | CRIAR |
| `field-maps.ts` | CRIAR |
| `erp-driver.ts` | REFATORAR (usar field-maps, retornar response models) |
| `tool-handlers.ts` | SIMPLIFICAR (só valida e encapsula) |
| `erp-types.ts` | LIMPAR (remover Raw types e ErpInvoice) |
| `erp-providers/*.ts` | SEM MUDANÇAS |
| `tool-catalog.ts` | SEM MUDANÇAS |

### Fluxo exemplo: `erp_client_lookup("123.456.789-00")`

1. **Handler** valida CPF → chama `buscarCliente(cpf)`
2. **Driver** chama `resolveActiveConfigs()` → retorna `[ixc_config, sgp_config]`
3. Para cada config: `getProvider()` → `driver.fetchClientes(creds, { cpf_cnpj })` → `any[]`
4. Aplica `fieldMaps.mapCliente[provider](raw)` → `{ id, nome, cpf_cnpj }`
5. Monta `ClienteResponse` adicionando `erp: providerName`
6. Retorna `ToolEnvelope<ClienteResponse>` com `encontrados`, `itens`, `erros`
7. **Handler** empacota no `ToolResult` → IA recebe JSON controlado

