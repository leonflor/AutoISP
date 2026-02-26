

# Arquitetura ERP — 3 Camadas

## Regra de Equivalências

> **Sempre que houver tipos em qualquer camada, as equivalências entre campos do ERP e campos normalizados devem ser documentadas/perguntadas antes de implementar.**

## Fluxo por operação

```text
Camada 1 — Tool Handler (tool-handlers.ts)
  Valida input, chama Driver, monta payload JSON para o modelo.

Camada 2 — Driver (erp-driver.ts)
  Resolve configs, chama Provider, MAPEIA campos crus → tipos internos, normaliza negócio.

Camada 3 — Provider (erp-providers/*.ts)
  HTTP puro. Retorna any[] cru da API do ERP. Sem mapeamento de campos.
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
- **Driver**: Mapeamento de campos por provider (`mapClienteFromProvider`, etc.), normalização de status, sanitização de endereço, orquestração de cadeias (ex: cliente → contrato → fatura).
- **Tool Handler**: Validação de input, formatação de resposta para o modelo de IA.
