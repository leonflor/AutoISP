

# Documentar Alteracoes no Guia do Projeto

## Diagnostico

A refatoracao das 3 camadas introduziu mudancas profundas que deixaram o guia desatualizado em dois arquivos principais:

### `ERPIntegration.tsx` — 7 secoes desatualizadas

1. **Diagrama da Arquitetura (linhas 144-167)**: Menciona `ContractStatus`, `fetchRawClients`, `normalizeClient()`, `RawErpClient` — tipos e funcoes que foram removidos
2. **Fluxo de Requisicao (linhas 174-197)**: Referencia `provider.fetchRawClients()` e `normalizeClient()` — substituidos por funcoes granulares compostas no Driver
3. **Tabela de Arquivos (linhas 244-247)**: Lista `erp-fetcher.ts` como arquivo ativo — foi deletado
4. **Normalizacao de Status (linhas 357-418)**: Documenta `ContractStatus` com mapeamentos antigos (`contrato.status = "A"/"S"`) — substituido por `InternetStatus` usando `status_internet` do `cliente_contrato`
5. **Tool Handlers IA (linhas 564-573)**: Indica `erp_invoice_search → mock (integracao futura)` — agora e real via `fetchInvoices()` conectado ao `/fn_areceber` do IXC
6. **Como Adicionar Novo ERP (linhas 707-745)**: Codigo de exemplo usa `fetchRawClients`, `ContractStatus`, `HUBSOFT_STATUS_MAP` — tudo removido
7. **Troubleshooting (linhas 787-789)**: Menciona status `"desconhecido"` — agora e `"outros"`

### `ImplementacaoTab.tsx` — 1 secao desatualizada

1. **Modulos Compartilhados (linhas 768-779)**: Lista `erp-fetcher.ts` como modulo ativo, descreve `erp-types.ts` com `ContractStatus`, descreve `erp-driver.ts` incorretamente como "Interface base do driver"

## Plano de Alteracoes

### Arquivo 1: `src/components/guia-projeto/integracoes/ERPIntegration.tsx`

**1. Diagrama da Arquitetura (linhas 143-167)**

Substituir o diagrama ASCII para refletir a arquitetura atual:
- Camada 1: `ErpClient`, `ErpInvoice`, `InternetStatus`, `ErpProvider`
- Camada 2: `composeIxcClients()`, `composeSimpleClients()`, `fetchInvoices()`, `normalizeInternetStatus()`
- Camada 3: Funcoes granulares por endpoint (`fetchClientes`, `fetchContratos`, `fetchRadusuarios`, `fetchFibra`, `fetchFaturas`, `fetchRawSignal`)

**2. Fluxo de Requisicao (linhas 174-197)**

Atualizar para mostrar dois fluxos: listagem de assinantes (composicao IXC com 4 chamadas paralelas) e consulta de faturas (fluxo sequencial CPF → id_cliente → `/fn_areceber`).

**3. Tabela de Arquivos (linhas 204-249)**

- Remover linha do `erp-fetcher.ts`
- Atualizar descricao do `erp-types.ts`: "Interfaces, InternetStatus, RawFatura, ErpInvoice, ErpProviderDriver"
- Atualizar descricao do `erp-driver.ts`: "Orquestracao, composicao granular, normalizacao status_internet, fetchInvoices"
- Atualizar descricao dos providers: "Funcoes granulares por endpoint (IXC: 6, SGP: 3, MK: 3)"

**4. Normalizacao de Status (linhas 357-418)**

Substituir inteiramente:
- Titulo: "Normalizacao de status_internet"
- Explicar que o campo vem de `cliente_contrato.status_internet` (bruto do IXC)
- Novo tipo: `InternetStatus = "ativo" | "bloqueado" | "financeiro_em_atraso" | "outros"`
- Tabela de mapeamento IXC: `normal→ativo`, `bloqueado→bloqueado`, `bloqueio_manual→bloqueado`, `bloqueio_automatico→bloqueado`, `reduzido→financeiro_em_atraso`, `pendente_reativa→bloqueado`, `desativado→bloqueado`, `default→outros`
- Nota: SGP/MK retornam `"ativo"` como padrao (sem contratos granulares)
- Nota: Filtro de contratos ativos (`status='A'`) ocorre na Camada 3

**5. Tool Handlers IA (linhas 563-574)**

Atualizar lista:
- `erp_search` → `searchClients()` — busca por CPF/CNPJ, retorna `status_internet`
- `erp_invoice_search` → `fetchInvoices()` — faturas reais via IXC `/fn_areceber` (SGP/MK retornam `[]`)
- `onu_diagnostics` → `fetchClientSignal()` — diagnostico ONU
- Remover mencao a "mock"

**6. Como Adicionar Novo ERP (linhas 716-743)**

Atualizar codigo de exemplo:
- Usar `fetchClientes()`, `fetchContratos()`, `fetchFaturas()` em vez de `fetchRawClients()`
- Remover referencia a `ContractStatus` e `HUBSOFT_STATUS_MAP`
- Explicar que a normalizacao de `status_internet` ocorre no Driver com mapa por provider

**7. Troubleshooting (linha 787-789)**

- Mudar `Status "desconhecido"` para `Status "outros"` 
- Mudar descricao para "Valor do campo status_internet nao mapeado no IXC_INTERNET_STATUS_MAP"

### Arquivo 2: `src/components/guia-projeto/ImplementacaoTab.tsx`

**1. Modulos Compartilhados (linhas 768-779)**

Atualizar lista de 10 modulos para 9 (removido `erp-fetcher.ts`) e corrigir descricoes:
- `tool-handlers.ts`: manter descricao atual
- `tool-catalog.ts`: manter descricao atual
- Remover `erp-fetcher.ts` completamente
- `erp-types.ts`: "Tipos padrao de ERP (ErpClient, ErpInvoice, InternetStatus, RawFatura, ErpProviderDriver)"
- `erp-driver.ts`: "Orquestrador: composicao granular, normalizacao status_internet, fetchInvoices, decrypt AES-256-GCM"
- `erp-providers/ixc.ts`: "Conector IXC Soft — 6 funcoes granulares (clientes, contratos, radusuarios, fibra, faturas, sinal)"
- `erp-providers/sgp.ts`: "Conector SGP — clientes + stubs para contratos/faturas"
- `erp-providers/mk.ts`: "Conector MK-Solutions — clientes + stubs para contratos/faturas"
- Atualizar contador de "9 modulos" para "8 modulos" (header da secao)

## Resumo de Impacto

| Arquivo | Secoes Alteradas |
|---|---|
| `ERPIntegration.tsx` | 7 secoes: diagrama, fluxo, tabela arquivos, status, tools IA, novo ERP, troubleshooting |
| `ImplementacaoTab.tsx` | 1 secao: modulos compartilhados |

