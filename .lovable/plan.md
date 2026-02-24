

# Refatoracao Completa: 3 Camadas + Tools Atomicas + Faturas Reais IXC

## Entendimento

1. **Sem retrocompatibilidade** — `erp-fetcher.ts` sera deletado, `fetchRawClients` sera removido
2. **Tools sao atomicas** — cada tool e um passo no fluxo do agente, nao um fluxo completo
3. **Filtros na Camada 3** — contratos so retornam `status='A'`, faturas so retornam `status='A'` (a receber)
4. **status_internet** — campo do `cliente_contrato` que indica o estado da conexao. Normalizado na Camada 2 para: `ativo`, `bloqueado`, `financeiro_em_atraso`, `outros`
5. **Status de contrato/fatura nao existem na Camada 1** — os filtros ja ocorrem na Camada 3

## Arquitetura Final

```text
┌─────────────────────────────────────────────────────┐
│  CAMADA 1 — TOOL HANDLERS (tool-handlers.ts)        │
│  erp_search        → busca cliente por CPF/CNPJ     │
│  erp_invoice_search → busca faturas em aberto       │
│  onu_diagnostics   → diagnostico ONU                │
│  Recebe dados ja normalizados. Define formato final.│
├─────────────────────────────────────────────────────┤
│  CAMADA 2 — DRIVER (erp-driver.ts)                  │
│  searchClients()   → orquestra busca de clientes    │
│  fetchInvoices()   → orquestra busca de faturas     │
│  fetchClientSignal() → orquestra diagnostico ONU    │
│  Normaliza status_internet. Injeta provider.        │
├─────────────────────────────────────────────────────┤
│  CAMADA 3 — CONECTORES (erp-providers/*.ts)         │
│  IXC: fetchClientes, fetchContratos, fetchFaturas,  │
│       fetchRadusuarios, fetchFibra, fetchSignal     │
│  SGP/MK: fetchClientes (stub vazio para faturas)    │
│  Dados brutos. Filtros ERP-specificos aqui.         │
└─────────────────────────────────────────────────────┘
```

## Mudancas por Arquivo

### 1. DELETAR `erp-fetcher.ts`

Nao e importado por nenhum arquivo. Contem funcoes legadas que nao serao mais usadas.

### 2. `erp-types.ts` — Novos tipos, remover ContractStatus

**Remover:**
- `ContractStatus` (nao e mais usado na Camada 1; filtro ocorre na Camada 3)

**Adicionar:**

```text
// Status da internet normalizado (Camada 2)
type InternetStatus = "ativo" | "bloqueado" | "financeiro_em_atraso" | "outros"

// Tipo bruto de fatura (Camada 3)
RawFatura {
  id: string
  id_cliente: string
  data_vencimento: string
  valor: number
  valor_pago: number | null
  linha_digitavel: string | null
  gateway_link: string | null
}

// Fatura normalizada (Camada 2 → Camada 1)
ErpInvoice {
  provider: ErpProvider
  provider_name: string
  id: string
  id_cliente: string
  data_vencimento: string
  valor: number
  valor_pago: number | null
  dias_atraso: number
  linha_digitavel: string | null
  gateway_link: string | null
}

// Filtro de faturas
FaturaFilter {
  cpf_cnpj: string
}
```

**Modificar `ErpProviderDriver`:**

```text
ErpProviderDriver {
  supportedFields(): string[]
  testConnection(creds): Promise<TestResult>

  // Granulares (opcionais por provider)
  fetchClientes?(creds, filtro?: { cpf_cnpj: string }): Promise<RawCliente[]>
  fetchContratos?(creds, filtro?: { id_cliente: string }): Promise<RawContrato[]>
  fetchRadusuarios?(creds): Promise<RawRadusuario[]>
  fetchFibra?(creds): Promise<RawFibraRecord[]>
  fetchFaturas?(creds, filtro: FaturaFilter): Promise<RawFatura[]>
  fetchRawSignal?(creds, clientId: string): Promise<RawSignalData>
}
```

**Remover `fetchRawClients`** da interface (sem retrocompatibilidade).

**Modificar `ErpClient`:**
- Substituir `status_contrato: ContractStatus` por `status_internet: InternetStatus`
- O campo `status_contrato` deixa de existir; o filtro de contratos ativos ocorre na Camada 3

### 3. `erp-providers/ixc.ts` — Granularizar + fetchFaturas real

**Extrair funcoes granulares** a partir do bloco monolitico atual:

| Funcao | Endpoint | Filtro na Camada 3 |
|---|---|---|
| `fetchRadusuarios(creds)` | `/radusuarios` | nenhum |
| `fetchClientes(creds, filtro?)` | `/cliente` | `cnpj_cpf` quando filtro presente |
| `fetchContratos(creds, filtro?)` | `/cliente_contrato` | `status='A'` (so ativos) |
| `fetchFibra(creds)` | `/radpop_radio_cliente_fibra` | nenhum |
| `fetchFaturas(creds, filtro)` | `/fn_areceber` | `status='A'` (a receber) |
| `fetchRawSignal(creds, clientId)` | `/botao_rel_22991` | por id_cliente |

**Fluxo fetchFaturas IXC:**

```text
1. Recebe { cpf_cnpj }
2. fetchClientes(creds, { cpf_cnpj }) → obtem id_cliente
3. POST /fn_areceber com qtype=id_cliente, query=id, filtro status='A'
4. Retorna RawFatura[]
```

**O metodo `fetchRawClients` sera removido.** A composicao (radusuarios + clientes + contratos + fibra) passa para o Driver.

**Contrato agora inclui `status_internet`** — campo bruto retornado como esta do IXC.

### 4. `erp-providers/sgp.ts` e `mk.ts` — Adaptar interface

- Remover `fetchRawClients`
- Adicionar `fetchClientes(creds)` contendo a logica atual
- Adicionar `fetchFaturas()` retornando `[]` (stub)
- Adicionar `fetchContratos()` retornando `[]` (stub)

### 5. `erp-driver.ts` — Refatorar composicao + fetchInvoices

**Refatorar `fetchAllClients`:**

Em vez de chamar `driver.fetchRawClients()`, o Driver agora compoe as chamadas granulares:

```text
// Para IXC:
const [rads, clientes, contratos, fibra] = await Promise.all([
  provider.fetchRadusuarios(creds),
  provider.fetchClientes(creds),
  provider.fetchContratos(creds),      // ja filtra status='A'
  provider.fetchFibra(creds),
])
// Monta maps, itera rads, join 1:1 com contrato via id_contrato
// Normaliza status_internet

// Para SGP/MK:
const clientes = await provider.fetchClientes(creds)
// Monta resultado direto
```

**Normalizacao de status_internet (Camada 2):**

```text
IXC_INTERNET_STATUS_MAP:
  "normal"           → "ativo"
  "bloqueado"        → "bloqueado"
  "reduzido"         → "financeiro_em_atraso"
  "pendente_reativa" → "bloqueado"
  default            → "outros"
```

**Nova funcao `fetchInvoices`:**

```text
fetchInvoices(supabase, ispId, encryptionKey, cpfCnpj)
  → resolve ERPs ativos
  → para cada ERP: provider.fetchFaturas(creds, { cpf_cnpj })
  → calcula dias_atraso para cada fatura
  → injeta provider/provider_name
  → retorna ErpInvoice[]
```

**Remover:**
- `normalizeStatus()` (ContractStatus nao existe mais)
- `IXC_STATUS_MAP`, `SGP_STATUS_MAP`, `MK_STATUS_MAP`

### 6. `tool-handlers.ts` — Conectar faturas reais + remover tool redundante

**`erp_invoice_search`** — substituir mock por chamada real:

```text
erpInvoiceSearchHandler:
  1. Recebe cliente_id (CPF/CNPJ)
  2. Chama driver.fetchInvoices(supabase, ispId, key, cliente_id)
  3. Calcula total_aberto (soma de faturas)
  4. Retorna faturas reais
```

**Remover `erp_active_client_search`** — era redundante (filtrava `status_contrato === 'ativo'` que nao existe mais; o `erp_search` ja retorna so contratos ativos pela Camada 3).

**Atualizar `erp_search`** — o campo `status` muda de `status_contrato` para `status_internet`.

### 7. `tool-catalog.ts` (backend) — Remover tool redundante

Remover `erp_active_client_search` do catalogo. O `erp_search` ja retorna apenas clientes com contrato ativo (filtro na Camada 3).

Atualizar `response_description` do `erp_search` para mencionar `status_internet`.

### 8. `src/constants/tool-catalog.ts` (frontend) — Sincronizar

Remover `erp_active_client_search` do catalogo de exibicao no admin.

### 9. `fetch-erp-clients/index.ts` — Atualizar import

Ajustar para usar as novas funcoes do Driver (que agora compoe internamente).

## Resumo de Impacto

| Arquivo | Acao |
|---|---|
| `erp-fetcher.ts` | **DELETAR** |
| `erp-types.ts` | Remover ContractStatus, adicionar InternetStatus, RawFatura, ErpInvoice, expandir interface |
| `erp-providers/ixc.ts` | Granularizar em 6 funcoes, remover fetchRawClients, adicionar fetchFaturas real |
| `erp-providers/sgp.ts` | Adaptar interface, stubs para faturas/contratos |
| `erp-providers/mk.ts` | Adaptar interface, stubs para faturas/contratos |
| `erp-providers/index.ts` | Sem mudanca |
| `erp-driver.ts` | Refatorar composicao, adicionar fetchInvoices, normalizar status_internet |
| `tool-handlers.ts` | Conectar faturas reais, remover erp_active_client_search |
| `tool-catalog.ts` (backend) | Remover erp_active_client_search, atualizar descricoes |
| `src/constants/tool-catalog.ts` (frontend) | Remover erp_active_client_search |
| `fetch-erp-clients/index.ts` | Ajustar imports |
| Edge functions | Reimplantar: fetch-erp-clients, ai-chat |

