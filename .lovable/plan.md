

# Refatoração: Provider como camada HTTP pura dentro do Driver

## Mudança de responsabilidade

```text
ANTES                                    DEPOIS
──────                                   ──────
Provider: HTTP + mapeamento de campos    Provider: HTTP + filtros HTTP apenas, retorna any[]
Driver:   normalização de negócio        Driver:   mapeamento de campos + normalização de negócio
```

## Fluxo por operação

```text
tool-handlers/contract-lookup.ts (valida CPF, chama driver)
  ↓
erp-driver/contract-lookup.ts (itera configs, chama provider, MAPEIA campos, normaliza)
  ↓
erp-providers/ixc.ts → ixc_contract_lookup(creds, {id_cliente}) → any[]  (HTTP puro)
```

## Mudanças na interface ErpProviderDriver (erp-types.ts)

Todos os métodos passam a retornar `any[]` ou `any` em vez de tipos Raw:

| Método atual | Retorno atual | Retorno novo |
|---|---|---|
| `fetchClientes` | `RawCliente[]` | `any[]` |
| `fetchContratos` | `RawContrato[]` | `any[]` |
| `fetchContratosDetalhados` | `RawContratoDetalhado[]` | `any[]` |
| `fetchRadusuarios` | `RawRadusuario[]` | `any[]` |
| `fetchFibra` | `RawFibraRecord[]` | `any[]` |
| `fetchFaturas` | `RawFatura[]` | `any[]` |
| `fetchRawSignal` | `RawSignalData` | `any` |

Os tipos `RawCliente`, `RawContrato`, etc. continuam existindo mas passam a ser usados exclusivamente pelo Driver no momento do mapeamento.

## Mudanças por arquivo

### 1. `erp-types.ts`
- Atualizar interface `ErpProviderDriver`: métodos retornam `any[]` / `any`
- Remover o parâmetro tipado `FaturaFilter` dos providers (filtro agora é genérico)
- Manter tipos Raw como referência interna do Driver

### 2. `erp-providers/ixc.ts`
- Remover TODO mapeamento de campos (nada de `razao→nome`, `cnpj_cpf→cpf_cnpj`)
- Cada função retorna `any[]` direto do `ixcFetch`
- Manter filtros HTTP (ex: `status === "A"` como filtro pós-fetch quando API não suporta filtro direto)
- Manter helpers: `normalizeUrl`, `buildAuth`, `ixcFetch`, `buildDocVariants`
- `fetchFaturas` perde a orquestração (não chama mais fetchClientes/fetchContratos internamente). Passa a receber `id_contrato` e faz apenas 1 chamada HTTP ao `/fn_areceber`. A orquestração move para o Driver.

Renomear funções internas:
- `fetchClientes` → `ixc_client_lookup`
- `fetchContratos` → `ixc_contract_lookup`  
- `fetchContratosDetalhados` → `ixc_contract_lookup_detailed`
- `fetchFaturas` → `ixc_invoice_search` (agora recebe `id_contrato`, não `cpf_cnpj`)
- `fetchRadusuarios` → `ixc_radusuarios`
- `fetchFibra` → `ixc_fibra`
- `fetchRawSignal` → `ixc_onu_diagnostics`

### 3. `erp-providers/mk.ts`
- Mesmo padrão: remover mapeamento, retornar `any[]`
- `fetchClientes` → `mk_client_lookup`, retorna `any[]` cru

### 4. `erp-providers/sgp.ts`
- Mesmo padrão

### 5. `erp-driver.ts` (ou `erp-driver/` se separar por arquivo)
- Adicionar bloco de mapeamento POR PROVIDER para cada operação:

```text
// Exemplo em erp_client_lookup:
const raw = await driver.fetchClientes(creds, { cpf_cnpj });
const mapped = raw.map((r) => mapClienteFromProvider(providerKey, r));

function mapClienteFromProvider(provider: ErpProvider, raw: any): RawCliente {
  if (provider === "ixc") {
    return { id: String(raw.id), nome: raw.razao || raw.fantasia || "", cpf_cnpj: raw.cnpj_cpf || "" };
  }
  if (provider === "mk_solutions") {
    return { id: String(raw.CodigoCliente || raw.id), nome: raw.NomeRazaoSocial || "", cpf_cnpj: raw.CpfCnpj || "" };
  }
  // sgp...
}
```

- `fetchInvoices` assume a orquestração: chama `driver.fetchClientes` → mapeia → chama `driver.fetchContratos` → mapeia → para cada contrato chama `driver.fetchFaturas(creds, contrato.id)` → mapeia
- Sanitização de endereço (SN, vírgulas) permanece no Driver
- Normalização de `status_internet` permanece no Driver

### 6. `tool-handlers.ts`
- Sem mudança (já chama o Driver)

### 7. `tool-catalog.ts`
- Sem mudança

### 8. `.lovable/plan.md`
- Atualizar com a regra: "Sempre que houver tipos em qualquer camada, as equivalências entre campos do ERP e campos normalizados devem ser documentadas/perguntadas antes de implementar."

## Equivalências de campos que serão movidas para o Driver

### IXC → Tipos internos

| Campo IXC | Campo normalizado | Tipo |
|---|---|---|
| `razao` / `fantasia` | `nome` | string |
| `cnpj_cpf` | `cpf_cnpj` | string |
| `contrato` / `id_vd_contrato` | `plano` | string |
| `dia_vencimento` | `dia_vencimento` | string |
| `status_internet` | → `normalizeInternetStatus()` | InternetStatus |
| `online` (S/N) | `conectado` | boolean |
| `sinal_rx` | `signal_db` | number |
| `endereco`, `numero`, `bairro`, `cidade`, `estado`, `cep`, `complemento` | mesmos nomes | string |
| `status` (A/etc) | filtro ativo/inativo | - |

### MK → Tipos internos

| Campo MK | Campo normalizado |
|---|---|
| `CodigoCliente` | `id` |
| `NomeRazaoSocial` | `nome` |
| `CpfCnpj` | `cpf_cnpj` |

### SGP → Tipos internos

| Campo SGP | Campo normalizado |
|---|---|
| `id` | `id` |
| `nome` / `razao_social` | `nome` |
| `cpf` / `cnpj` | `cpf_cnpj` |

## Risco e mitigação

- **Risco**: Quebra de contrato se algum campo do ERP muda de nome numa atualização do IXC/MK/SGP.
- **Mitigação**: O mapeamento está centralizado no Driver por provider, então a correção é pontual.
- **Contraponto**: Antes o mapeamento estava espalhado nos providers, agora fica centralizado — mais fácil de auditar.

## Deploy

- Redeploy `ai-chat` após as mudanças
- Testar com CNPJ `12.059.400/0001-51`

