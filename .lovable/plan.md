

# Arquitetura ERP — 3 Camadas

## Regra de Equivalências

> **Sempre que houver tipos em qualquer camada, as equivalências entre campos do ERP e campos normalizados devem ser documentadas/perguntadas antes de implementar.**

## Regras de Proteção

> **ALERTA OBRIGATÓRIO**: Os arquivos abaixo NÃO podem ser editados sem ordem expressa do usuário. Qualquer plano que preveja alteração neles deve alertar antes de implementar:
> - `field-maps.ts` — mapeamento declarativo ERP → modelo
> - `erp-providers/*.ts` — conectores HTTP dos ERPs
> - `ixc-types.ts` — modelagem ORM dos campos IXC

## Fluxo por operação

```text
Camada 1 — Tool Handler (tool-handlers.ts)
  Valida input (CPF/CNPJ), chama Driver, retorna ToolResult<ToolEnvelope>.

Camada 2 — Driver (erp-driver.ts)
  Resolve configs ativos, chama Provider, aplica field-maps, retorna ToolEnvelope<ResponseModel>.

Camada 3 — Provider (erp-providers/*.ts)
  HTTP puro. Retorna any[] cru da API do ERP. Sem mapeamento de campos.
```

## Estrutura de arquivos

```text
supabase/functions/_shared/
├── response-models.ts     — Interfaces do JSON que a IA recebe (ClienteResponse, ContratoResponse, FaturaResponse, ToolEnvelope)
├── field-maps.ts          — Mapeamento declarativo ERP → modelo, por provider (mapCliente, mapContrato, mapFatura, etc.)
├── erp-driver.ts          — Orquestrador: buscarCliente(), buscarContratos(), buscarFaturas() + funções de monitoramento em massa
├── tool-handlers.ts       — Valida input + chama driver + retorna ToolResult
├── tool-catalog.ts        — JSON Schema das ferramentas (function calling OpenAI)
├── erp-types.ts           — Tipos compartilhados (ErpProvider, ErpClient, ErpCredentials, ErpProviderDriver)
├── erp-providers/
│   ├── index.ts           — Registry de providers
│   ├── ixc.ts             — HTTP puro IXC
│   ├── ixc-types.ts       — Modelagem ORM 1:1 dos campos IXC
│   ├── sgp.ts             — HTTP puro SGP
│   └── mk.ts              — HTTP puro MK-Solutions
└── onu-signal-analyzer.ts — Classificação de sinal óptico
```

## Equivalências de campos

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
| `id` / `codigo` / `cd_cliente` | `id` |
| `nome` / `razao_social` / `nm_cliente` | `nome` |
| `cpf_cnpj` / `cpf` / `cnpj` | `cpf_cnpj` |

## Responsabilidades

- **Provider**: HTTP + filtros HTTP (ex: `status === "A"` pós-fetch). Retorna `any[]`.
- **Driver**: Orquestra configs ativos, aplica `field-maps` para mapeamento declarativo, normaliza status, sanitiza endereço. Retorna `ToolEnvelope<ResponseModel>`.
- **Tool Handler**: Validação de input, encapsula resultado do driver em `ToolResult`.

## Response Models (o que a IA recebe)

### ClienteResponse (erp_client_lookup)
```json
{ "nome": "João Silva", "cpf_cnpj": "123.456.789-00", "erp": "IXC Soft" }
```

### ContratoResponse (erp_contract_lookup)
```json
{ "ordem": 1, "contrato_id": "123", "endereco": "Rua A", "numero": "100", "complemento": null, "bairro": "Centro", "endereco_completo": "Rua A, nº 100, Centro", "plano": "100MB", "status": "ativo", "dia_vencimento": "10", "erp": "IXC Soft" }
```

### FaturaResponse (erp_invoice_search)
```json
{ "id": "456", "contrato_id": "123", "endereco": "Rua A, nº 100, Centro", "valor": 99.90, "vencimento": "2025-01-10", "dias_atraso": 15, "linha_digitavel": "23793...", "gateway_link": "https://...", "erp": "IXC Soft" }
```

### Envelope padrão
```json
{ "encontrados": 2, "itens": [...], "mensagem": "...", "erros": [] }
```
